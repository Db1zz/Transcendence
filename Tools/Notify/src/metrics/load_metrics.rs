use std::{
    sync::atomic::{AtomicU64, AtomicUsize, Ordering},
    time::Duration,
};

#[derive(Debug, Default)]
pub struct LoadMetrics {
    queue_size: AtomicUsize,
    latency_sum_ms: AtomicU64,
    latency_samples: AtomicU64,
}

impl LoadMetrics {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn inc_queue(&self) {
        self.queue_size.fetch_add(1, Ordering::Relaxed);
    }

    pub fn dec_queue(&self) {
        let _ = self
            .queue_size
            .fetch_update(Ordering::Relaxed, Ordering::Relaxed, |v| v.checked_sub(1));
    }

    pub fn record_latency(&self, latency: Duration) {
        let ms = latency.as_millis() as u64;
        self.latency_sum_ms.fetch_add(ms, Ordering::Relaxed);
        self.latency_samples.fetch_add(1, Ordering::Relaxed);
    }

    pub fn queue_size(&self) -> usize {
        self.queue_size.load(Ordering::Relaxed)
    }

    pub fn avg_latency_ms(&self) -> f64 {
        let samples = self.latency_samples.load(Ordering::Relaxed);
        if samples == 0 {
            return 0.0;
        }

        let sum = self.latency_sum_ms.load(Ordering::Relaxed);
        sum as f64 / samples as f64
    }

    pub fn load(&self) -> f64 {
        let queue = self.queue_size() as f64;
        let avg_latency = self.avg_latency_ms();
        (queue * 0.5) + (avg_latency * 0.3)
    }
}
