import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      memberList: {
        offline: "Offline",
        online: "Online",
      },
      mobileNavBar: {
        main: "main",
        friends: "friends",
        notifications: "notifications",
        you: "you"
      },
      notifications: {
        over99: "99+",
        unreadCount: "{{count}} unread notifications",
        title: "notifications",
        subtitle: "Non-message alerts from the app",
        genericTitle: "Notification",
        genericBody: "You have a new update.",
        callSubtitle: "Tap to review or dismiss",
        live: "live",
        emptyTitle: "no notifications yet",
        emptyBody: "messages stay out of this view. other alerts will appear here.",
        clearAll: "clear all",
        dismiss: "Dismiss notification",
        someone: "Someone",
        user: "User {{id}}",
        callStarted: "{{name}} started a call."
      },
      notification: {
        user: "User {{id}}",
        new: "new",
        close: "Close notification"
      },
      status: {
        online: "online",
        idle: "idle",
        dnd: "do not disturb",
        offline: "offline"
      },
      serverHeader: {
        searchPlaceholder: "Search messages...",
      },
      serverLeftBar: {
        invitePeople: "Invite People",
        serverSettings: "Server Settings",
        voiceConnected: "Voice Connected",
        disconnect: "Disconnect",
        inviteTitle: "Invite friends to {{name}}",
        inviteDescription: "Share this code with others so they can join your server. It expires in 1 day.",
        generating: "Generating...",
        copied: "Copied!"
      },
      serverSettings: {
        title: "{{name}} Settings",
        tabs: {
          overview: "Overview",
          roles: "Roles",
          members: "Members"
        },
        overview: {
          title: "Server Overview",
          description: "Settings for {{name}} will go here."
        },
        roles: {
          title: "Server Roles",
          createNew: "Create New Role",
          namePlaceholder: "Role Name (e.g. Moderator)",
          createButton: "Create Role",
          existingRoles: "Existing Roles",
          roleCount: "{{count}} Roles",
          noRoles: "No custom roles created yet.",
          cancel: "Cancel",
          noPermissions: "No Permissions",
          deleteRole: "Delete Role"
        },
        members: {
          title: "Server Members",
          user: "User",
          roles: "Roles",
          addRole: "+ Add Role"
        },
        errors: {
          unexpected: "An unexpected error occurred.",
          updateFailed: "Failed to update role.",
          deleteFailed: "Failed to delete role."
        }
      },
      common: {
        unknown: "Unknown",
        save: "save",
        saving: "saving...",
        loading: "loading...",
        logout: "logout",
        message: "Message",
        admin: "ADMIN",
      },
      auth: {
        welcome: "welcome to anteiku cafe",
        login: {
          github: "Log in with GitHub",
          google: "Log in with Google",
          title: "login",
          subtitle: "sign in to continue",
          email: "email",
          password: "password",
          forgotPassword: "forgot password?",
          placeholderEmail: "enter your email",
          placeholderPassword: "enter your password",
          button: "login",
          noAccount: "don't have an account?",
          signUp: "sign up",
          errorInvalidCredentials: "incorrect credentials, try again",
        },
        signup: {
          title: "sign up",
          subtitle: "sign up to continue",
          success: "you have successfully created an account",
          backToLogin: "back to log in",
          email: "email",
          displayName: "display name",
          username: "username",
          password: "password",
          requiredMark: "*",
          placeholderEmail: "enter your email",
          placeholderDisplayName: "this is how others see you",
          placeholderUsername:
            "pls only use numbers,underscores and full stops",
          placeholderPassword: "create your password",
          checkInProgress: "checking...",
          emailAvailable: "this email is available",
          emailTaken: "this email already exists",
          usernameAvailable: "this username is free",
          usernameTaken: "this username is taken",
          button: "sign up",
          hasAccount: "already have an account?",
          login: "login",
          passwordNeedsPrefix: "password needs:",
          passwordRuleLength: "8+ characters",
          passwordRuleLower: "1 lowercase",
          passwordRuleUpper: "1 uppercase",
          passwordRuleNumber: "1 number",
          passwordRuleSymbol: "1 symbol",
        },
      },
      home: {
        loginToChat: "please log in to use chat",
        selectFriendToChat: "select a friend to start a chat",
      },
      info: {
        securedAdminPage: "secured admin page",
        defaultPage: "default PAGE",
      },
      settings: {
        title: "settings",
        myProfile: "my profile",
        voiceAndVideo: "voice and video",
        language: "language",
        languageForm: {
          title: "language",
          select: "select language",
          saveError: "Failed to save language",
          options: {
            en: "english",
            ru: "русский",
            de: "deutsch",
          },
        },
      },
      profile: {
        aboutMe: "about me",
        defaultBio: "This user is too lazy to write a bio.",
        memberSince: "member since",
        editProfile: "edit profile",
        friend: {
          add: "add friend",
          delete: "delete from friends",
          requestSent: "friend request sent",
        },
      },
      profileEdit: {
        uploadFromComputer: "upload from my device",
        uploading: "uploading...",
        pictureHint: "picture is set automatically after upload.",
        username: "username",
        displayableName: "displayable name",
        aboutMe: "about me",
        usernamePlaceholder: "your username",
        displayableNamePlaceholder: "name shown in profile",
        aboutPlaceholder: "tell people something about yourself",
        uploadError: "Failed to upload picture",
        saveError: "Failed to save profile changes",
      },
      friends: {
        title: "Friends",
        addFriend: "add friend",
        tabs: {
          online: "Online",
          all: "All",
          pending: "Pending",
          blocked: "Blocked",
        },
        tabTitle: {
          online: "Online - {{count}}",
          all: "All friends - {{count}}",
          pending: "Pending - {{count}}",
          blocked: "Blocked - {{count}}",
        },
        searchPlaceholder: "search friends.",
        empty: "noone here",
        chats: "chats",
        friendsList: "friends list",
        loadingChats: "loading chats...",
        noChats: "no chats yet",
        addView: {
          title: "add friend",
          subtitle: "you can add friends with their 'names'.",
          placeholder: "enter a name",
          sendRequest: "send request",
          success: "Friend request successfuly sent to {{name}}.",
          error: "There are no users with such name.",
          wow: "wau",
        },
        noFriendsOnline: "No friends online.",
      },
      chat: {
        online: "online",
        connecting: "connecting...",
        inputPlaceholder: "type a message...",
        send: "send",
      },
      header: {
        friends: "friends",
        messages: "messages",
        server: "server",
      },
      rightBar: {
        placeholder: "some content",
      },
      voice: {
        incomingCall: "Incoming call",
        mute: "Mute microphone",
        unmute: "Unmute microphone",
        headphonesOn: "Turn on headphones",
        headphonesOff: "Headphones off",
        cameraOff: "Turn off camera",
        cameraOn: "Turn on camera",
        endCall: "End call",
        you: "You",
        user: "User {{id}}",
        activeCall: "Voice call active.",
        return: "Return",
      },
      server: {
        create: {
          title: "create your server",
          description:
            "give your server a name. you can always change it later.",
          nameLabel: "server name",
          namePlaceholder: "server",
          cancel: "cancel",
          submit: "create",
        },
      },
    },
  },
  ru: {
    translation: {
      memberList: {
        offline: "Не в сети",
        online: "Онлайн",
      },
      mobileNavBar: {
        main: "главная",
        friends: "друзья",
        notifications: "уведомления",
        you: "вы"
      },
      notifications: {
        over99: "99+",
        unreadCount: "Непрочитанных уведомлений: {{count}}",
        title: "уведомления",
        subtitle: "Не-текстовые оповещения от приложения",
        genericTitle: "Уведомление",
        genericBody: "У вас новое обновление.",
        callSubtitle: "Нажмите, чтобы просмотреть или скрыть",
        live: "в эфире",
        emptyTitle: "пока нет уведомлений",
        emptyBody: "сообщения не отображаются здесь. другие оповещения появятся тут.",
        clearAll: "очистить все",
        dismiss: "Скрыть уведомление",
        someone: "Кто-то",
        user: "Пользователь {{id}}",
        callStarted: "{{name}} начал(а) звонок."
      },
      notification: {
        user: "Пользователь {{id}}",
        new: "новое",
        close: "Закрыть уведомление"
      },
      status: {
        online: "в сети",
        idle: "нет на месте",
        dnd: "не беспокоить",
        offline: "не в сети"
      },
      serverHeader: {
        searchPlaceholder: "Поиск сообщений...",
      },
      serverLeftBar: {
        invitePeople: "Пригласить людей",
        serverSettings: "Настройки сервера",
        voiceConnected: "Голосовая связь",
        disconnect: "Отключиться",
        inviteTitle: "Пригласить друзей в {{name}}",
        inviteDescription: "Поделитесь этим кодом с другими, чтобы они могли зайти на ваш сервер. Код истекает через 1 день.",
        generating: "Генерация...",
        copied: "Скопировано!"
      },
      serverSettings: {
        title: "Настройки {{name}}",
        tabs: {
          overview: "Обзор",
          roles: "Роли",
          members: "Участники"
        },
        overview: {
          title: "Обзор сервера",
          description: "Здесь будут настройки для {{name}}."
        },
        roles: {
          title: "Роли сервера",
          createNew: "Создать новую роль",
          namePlaceholder: "Имя роли (напр. Модератор)",
          createButton: "Создать роль",
          existingRoles: "Существующие роли",
          roleCount: "{{count}} ролей",
          noRoles: "Пользовательские роли еще не созданы.",
          cancel: "Отмена",
          noPermissions: "Нет прав",
          deleteRole: "Удалить роль"
        },
        members: {
          title: "Участники сервера",
          user: "Пользователь",
          roles: "Роли",
          addRole: "+ Добавить роль"
        },
        errors: {
          unexpected: "Произошла непредвиденная ошибка.",
          updateFailed: "Не удалось обновить роль.",
          deleteFailed: "Не удалось удалить роль."
        }
      },
      common: {
        unknown: "Неизвестно",
        save: "сохранить",
        saving: "сохранение...",
        loading: "загрузка...",
        logout: "выйти",
        message: "Сообщение",
        admin: "АДМИН",
      },
      auth: {
        welcome: "добро пожаловать в кафе anteiku",
        login: {
          github: "Войти через GitHub",
          google: "Войти через Google",
          title: "вход",
          subtitle: "войдите, чтобы продолжить",
          email: "почта",
          password: "пароль",
          forgotPassword: "забыли пароль?",
          placeholderEmail: "введите вашу почту",
          placeholderPassword: "введите ваш пароль",
          button: "войти",
          noAccount: "нет аккаунта?",
          signUp: "зарегистрироваться",
          errorInvalidCredentials: "неверные данные, попробуйте снова",
        },
        signup: {
          title: "регистрация",
          subtitle: "зарегистрируйтесь, чтобы продолжить",
          success: "вы успешно создали аккаунт",
          backToLogin: "обратно ко входу",
          email: "почта",
          displayName: "отображаемое имя",
          username: "имя пользователя",
          password: "пароль",
          requiredMark: "*",
          placeholderEmail: "введите вашу почту",
          placeholderDisplayName: "так вас будут видеть другие",
          placeholderUsername:
            "используйте только цифры, нижние подчеркивания и точки",
          placeholderPassword: "создайте пароль",
          checkInProgress: "проверяем...",
          emailAvailable: "эта почта свободна",
          emailTaken: "эта почта уже существует",
          usernameAvailable: "это имя пользователя свободно",
          usernameTaken: "это имя пользователя занято",
          button: "зарегистрироваться",
          hasAccount: "уже есть аккаунт?",
          login: "войти",
          passwordNeedsPrefix: "пароль должен содержать:",
          passwordRuleLength: "8+ символов",
          passwordRuleLower: "1 строчную",
          passwordRuleUpper: "1 заглавную",
          passwordRuleNumber: "1 цифру",
          passwordRuleSymbol: "1 спецсимвол",
        },
      },
      home: {
        loginToChat: "пожалуйста, войдите, чтобы использовать чат",
        selectFriendToChat: "выберите друга, чтобы начать чат",
      },
      info: {
        securedAdminPage: "защищенная страница администратора",
        defaultPage: "страница по умолчанию",
      },
      settings: {
        title: "настройки",
        myProfile: "мой профиль",
        voiceAndVideo: "голос и видео",
        language: "язык",
        languageForm: {
          title: "язык",
          select: "выберите язык",
          saveError: "Не удалось сохранить язык",
          options: {
            en: "english",
            ru: "русский",
            de: "deutsch",
          },
        },
      },
      profile: {
        aboutMe: "обо мне",
        defaultBio: "Этот пользователь слишком ленив, чтобы написать био.",
        memberSince: "участник с",
        editProfile: "редактировать профиль",
        friend: {
          add: "добавить в друзья",
          delete: "удалить из друзей",
          requestSent: "запрос в друзья отправлен",
        },
      },
      profileEdit: {
        uploadFromComputer: "загрузить с устройства",
        uploading: "загрузка...",
        pictureHint: "фото автоматически установится после загрузки.",
        username: "имя пользователя",
        displayableName: "отображаемое имя",
        aboutMe: "обо мне",
        usernamePlaceholder: "ваше имя пользователя",
        displayableNamePlaceholder: "имя, которое видно в профиле",
        aboutPlaceholder: "расскажите что-нибудь о себе",
        uploadError: "не удалось загрузить изображение",
        saveError: "не удалось сохранить изменения профиля",
      },
      friends: {
        title: "друзья",
        addFriend: "добавить друга",
        tabs: {
          online: "онлайн",
          all: "все",
          pending: "ожидают",
          blocked: "заблокированные",
        },
        tabTitle: {
          online: "онлайн - {{count}}",
          all: "все друзья - {{count}}",
          pending: "ожидают - {{count}}",
          blocked: "заблокированные - {{count}}",
        },
        searchPlaceholder: "поиск друзей.",
        empty: "никого нет",
        chats: "чаты",
        friendsList: "список друзей",
        loadingChats: "загрузка чатов...",
        noChats: "пока нет чатов",
        addView: {
          title: "добавить друга",
          subtitle: "вы можете добавлять друзей по их именам.",
          placeholder: "введите имя",
          sendRequest: "отправить запрос",
          success: "запрос в друзья успешно отправлен пользователю {{name}}.",
          error: "пользователь с таким именем не найден.",
          wow: "вау",
        },
        noFriendsOnline: "Нет друзей онлайн.",
      },
      chat: {
        offline: "не в сети",
        idle: "нет на месте",
        online: "онлайн",
        connecting: "подключение...",
        inputPlaceholder: "введите сообщение...",
        send: "отправить",
      },
      header: {
        friends: "друзья",
        messages: "сообщения",
        server: "сервер",
      },
      rightBar: {
        placeholder: "контент",
      },
      voice: {
        incomingCall: "Входящий звонок",
        mute: "Выключить микрофон",
        unmute: "Включить микрофон",
        headphonesOn: "Включить наушники",
        headphonesOff: "Выключить наушники",
        cameraOff: "Выключить камеру",
        cameraOn: "Включить камеру",
        endCall: "Завершить звонок",
        you: "Вы",
        user: "Пользователь {{id}}",
        activeCall: "Голосовой вызов активен",
        return: "Вернуться",
      },
      server: {
        create: {
          title: "создать свой сервер",
          description:
            "добавьте имя своему серверу. вы всегда можете поменять его позже.",
          nameLabel: "имя сервера",
          namePlaceholder: "сервер",
          cancel: "отмена",
          submit: "создать",
        },
      },
    },
  },
  de: {
    translation: {
      memberList: {
        offline: "Offline",
        online: "Online",
      },
      mobileNavBar: {
        main: "start",
        friends: "freunde",
        notifications: "mitteilungen",
        you: "du"
      },
      notifications: {
        over99: "99+",
        unreadCount: "{{count}} ungelesene Benachrichtigungen",
        title: "benachrichtigungen",
        subtitle: "Nicht-Nachrichten-Benachrichtigungen",
        genericTitle: "Benachrichtigung",
        genericBody: "Du hast ein neues Update.",
        callSubtitle: "Tippen zum Überprüfen oder Schließen",
        live: "live",
        emptyTitle: "noch keine benachrichtigungen",
        emptyBody: "Nachrichten bleiben hier draußen. Andere Warnungen erscheinen hier.",
        clearAll: "alles löschen",
        dismiss: "Benachrichtigung schließen",
        someone: "Jemand",
        user: "Benutzer {{id}}",
        callStarted: "{{name}} hat einen Anruf gestartet."
      },
      notification: {
        user: "Benutzer {{id}}",
        new: "neu",
        close: "Benachrichtigung schließen"
      },
      status: {
        online: "online",
        idle: "abwesend",
        dnd: "bitte nicht stören",
        offline: "offline"
      },
      serverHeader: {
        searchPlaceholder: "Nachrichten suchen...",
      },
      serverLeftBar: {
        invitePeople: "Leute einladen",
        serverSettings: "Servereinstellungen",
        voiceConnected: "Sprache verbunden",
        disconnect: "Trennen",
        inviteTitle: "Freunde zu {{name}} einladen",
        inviteDescription: "Teile diesen Code mit anderen, damit sie deinem Server beitreten können. Er läuft in 1 Tag ab.",
        generating: "Wird generiert...",
        copied: "Kopiert!"
      },
      serverSettings: {
        title: "{{name}} Einstellungen",
        tabs: {
          overview: "Übersicht",
          roles: "Rollen",
          members: "Mitglieder"
        },
        overview: {
          title: "Serverübersicht",
          description: "Einstellungen für {{name}} werden hier sein."
        },
        roles: {
          title: "Serverrollen",
          createNew: "Neue Rolle erstellen",
          namePlaceholder: "Rollenname (z. B. Moderator)",
          createButton: "Rolle erstellen",
          existingRoles: "Vorhandene Rollen",
          roleCount: "{{count}} Rollen",
          noRoles: "Noch keine benutzerdefinierten Rollen erstellt.",
          cancel: "Abbrechen",
          noPermissions: "Keine Berechtigungen",
          deleteRole: "Rolle löschen"
        },
        members: {
          title: "Servermitglieder",
          user: "Benutzer",
          roles: "Rollen",
          addRole: "+ Rolle hinzufügen"
        },
        errors: {
          unexpected: "Ein unerwarteter Fehler ist aufgetreten.",
          updateFailed: "Rolle konnte nicht aktualisiert werden.",
          deleteFailed: "Rolle konnte nicht gelöscht werden."
        }
      },
      common: {
        unknown: "Unbekannt",
        save: "speichern",
        saving: "speichern...",
        loading: "laden...",
        logout: "abmelden",
        message: "Nachricht",
        admin: "ADMIN",
      },
      auth: {
        welcome: "willkommen im anteiku cafe",
        login: {
          github: "Mit GitHub anmelden",
          google: "Mit Google anmelden",
          title: "anmelden",
          subtitle: "melde dich an, um fortzufahren",
          email: "e-mail",
          password: "passwort",
          forgotPassword: "passwort vergessen?",
          placeholderEmail: "gib deine e-mail ein",
          placeholderPassword: "gib dein passwort ein",
          button: "anmelden",
          noAccount: "hast du kein konto?",
          signUp: "registrieren",
          errorInvalidCredentials: "falsche daten, versuche es erneut",
        },
        signup: {
          title: "registrieren",
          subtitle: "registriere dich, um fortzufahren",
          success: "du hast erfolgreich ein konto erstellt",
          backToLogin: "zurück zur anmeldung",
          email: "e-mail",
          displayName: "anzeigename",
          username: "benutzername",
          password: "passwort",
          requiredMark: "*",
          placeholderEmail: "gib deine e-mail ein",
          placeholderDisplayName: "so sehen dich andere",
          placeholderUsername: "bitte nur zahlen, unterstriche und punkte",
          placeholderPassword: "erstelle dein passwort",
          checkInProgress: "prüfen...",
          emailAvailable: "diese e-mail ist verfügbar",
          emailTaken: "diese e-mail existiert bereits",
          usernameAvailable: "dieser benutzername ist frei",
          usernameTaken: "dieser benutzername ist vergeben",
          button: "registrieren",
          hasAccount: "hast du schon ein konto?",
          login: "anmelden",
          passwordNeedsPrefix: "passwort braucht:",
          passwordRuleLength: "8+ zeichen",
          passwordRuleLower: "1 kleinbuchstaben",
          passwordRuleUpper: "1 großbuchstaben",
          passwordRuleNumber: "1 zahl",
          passwordRuleSymbol: "1 symbol",
        },
      },
      home: {
        loginToChat: "bitte melde dich an, um den chat zu nutzen",
        selectFriendToChat: "wähle einen freund, um einen chat zu starten",
      },
      info: {
        securedAdminPage: "geschützte admin-seite",
        defaultPage: "standardseite",
      },
      settings: {
        title: "einstellungen",
        myProfile: "mein profil",
        voiceAndVideo: "sprache und video",
        language: "sprache",
        languageForm: {
          title: "sprache",
          select: "sprache auswählen",
          saveError: "Sprache konnte nicht gespeichert werden",
          options: {
            en: "english",
            ru: "русский",
            de: "deutsch",
          },
        },
      },
      profile: {
        aboutMe: "über mich",
        defaultBio: "Dieser Benutzer ist zu faul, um eine Bio zu schreiben.",
        memberSince: "mitglied seit",
        editProfile: "profil bearbeiten",
        friend: {
          add: "freund hinzufügen",
          delete: "aus freunden entfernen",
          requestSent: "freundschaftsanfrage gesendet",
        },
      },
      profileEdit: {
        uploadFromComputer: "vom Gerät hochladen",
        uploading: "hochladen...",
        pictureHint: "bild wird nach dem hochladen automatisch gesetzt.",
        username: "benutzername",
        displayableName: "anzeigename",
        aboutMe: "über mich",
        usernamePlaceholder: "dein benutzername",
        displayableNamePlaceholder: "name im profil",
        aboutPlaceholder: "erzähle etwas über dich",
        uploadError: "Bild konnte nicht hochgeladen werden",
        saveError: "Profiländerungen konnten nicht gespeichert werden",
      },
      friends: {
        title: "Freunde",
        addFriend: "Freund hinzufügen",
        tabs: {
          online: "Online",
          all: "Alle",
          pending: "Ausstehend",
          blocked: "Blockiert",
        },
        tabTitle: {
          online: "Online - {{count}}",
          all: "Alle Freunde - {{count}}",
          pending: "Ausstehend - {{count}}",
          blocked: "Blockiert - {{count}}",
        },
        searchPlaceholder: "freunde suchen.",
        empty: "niemand hier",
        chats: "chats",
        friendsList: "freundesliste",
        loadingChats: "chats werden geladen...",
        noChats: "noch keine chats",
        addView: {
          title: "Freund hinzufügen",
          subtitle: "du kannst freunde mit ihren namen hinzufügen.",
          placeholder: "namen eingeben",
          sendRequest: "anfrage senden",
          success: "Freundschaftsanfrage erfolgreich an {{name}} gesendet.",
          error: "Es gibt keinen Benutzer mit diesem Namen.",
          wow: "wow",
        },
        noFriendsOnline: "Keine Freunde online.",
      },
      chat: {
        online: "online",
        connecting: "verbinden...",
        inputPlaceholder: "nachricht eingeben...",
        send: "senden",
      },
      header: {
        friends: "freunde",
        messages: "nachrichten",
        server: "server",
      },
      rightBar: {
        placeholder: "inhalt",
      },
      voice: {
        incomingCall: "Eingehender Anruf",
        mute: "Mikrofon stummschalten",
        unmute: "Mikrofon aktivieren",
        headphonesOff: "Kopfhörer aus",
        headphonesOn: "Kopfhörer einschalten",
        cameraOff: "Kamera ausschalten",
        cameraOn: "Kamera einschalten",
        endCall: "Anruf beenden",
        you: "Du",
        user: "Benutzer {{id}}",
        activeCall: "Sprachanruf aktiv",
        return: "Zurück",
      },
      server: {
        create: {
          title: "Erstelle deinen Server",
          description:
            "Gib deinem neuen Server mit einem Namen. Du kannst ihn später jederzeit ändern.",
          nameLabel: "Servername",
          namePlaceholder: "Server",
          cancel: "Abbrechen",
          submit: "Erstellen",
        },
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "de"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "preferredLanguage",
      caches: ["localStorage"],
    },
  });

export default i18n;
