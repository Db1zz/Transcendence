use async_trait::async_trait;
use futures::{channel::mpsc, SinkExt};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tokio::sync::Mutex;
use tracing::{error, instrument};

pub struct TaskManager<Task: TaskManagerTask> {
    max_workers: usize,
    is_exiting: Arc<AtomicBool>,

    sender: mpsc::Sender<Task>,
    receiver: Arc<Mutex<mpsc::Receiver<Task>>>,

    is_started: bool,
}

impl<Task: TaskManagerTask> TaskManager<Task>
where
    Task: TaskManagerTask + Send + 'static,
{
    pub fn new(max_workers: usize) -> Self {
        let (sender, receiver) = mpsc::channel::<Task>(1024);

        Self {
            max_workers,

            sender,
            receiver: Arc::new(Mutex::new(receiver)),

            is_exiting: Arc::new(AtomicBool::new(false)),
            is_started: false,
        }
    }

    #[instrument(skip(is_exiting, receiver))]
    async fn worker_routine(
        is_exiting: Arc<AtomicBool>,
        receiver: Arc<Mutex<mpsc::Receiver<Task>>>,
    ) {
        loop {
            // Not sure if relaxed check is valid here: https://assets.bitbashing.io/papers/concurrency-primer.pdf
            if is_exiting.load(Ordering::Relaxed) {
                break;
            }

            match receiver.lock().await.recv().await {
                Ok(task) => {
                    task.handle().await;
                }
                Err(e) => {
                    // recv() can fail only if all senders are dropped, therefore better to throw an error and exit
                    error!(error = ?e, "recv() error");
                    break;
                }
            }
        }
    }

    fn spawn_workers(&mut self) {
        for _ in 0..self.max_workers {
            let is_exiting = self.is_exiting.clone();
            let receiver = self.receiver.clone();

            tokio::spawn(async move {
                Self::worker_routine(is_exiting, receiver).await;
            });
        }
    }

    pub fn start(&mut self) {
        if self.is_started {
            return;
        }

        self.spawn_workers();
    }

    #[instrument(skip(self, task))]
    pub async fn submit(&mut self, task: Task) {
        if let Err(e) = self.sender.send(task).await {
            error!(error = %e, "send() failed");
            panic!();
        }
    }
}

impl<Task> Drop for TaskManager<Task>
where
    Task: TaskManagerTask,
{
    fn drop(&mut self) {
        // It shouldn't work if all threads are blocked and waiting for recv();
        // But the resource cleaning is not the main thing rn... TODO
        self.is_exiting.store(true, Ordering::Relaxed);
        self.is_started = false;
    }
}

#[async_trait]
pub trait TaskManagerTask {
    async fn handle(&self);
}
