var app = new Vue({
  el: '#app',
  data: {
    shortcut: '',
    link: '',
    showForm: false,
    registerationForm: false,
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  },
  computed: {
    hasShortcut() {
      return this.shortcut.trim().length !== 0;
    },
    hasLink() {
      return this.link.trim().length !== 0;
    },
    hasEmail() {
      return this.email.trim().length !== 0;
    },
    hasUsername() {
      return this.username.trim().length !== 0;
    },
    hasPassword() {
      return this.password.trim().length !== 0;
    },
    hasConfirmPassword() {
      return this.confirmPassword.trim().length !== 0;
    },
  },
  methods: {
    async addShortcut() {
      try {
        let response = await axios.post("/upload", {
          shortcut: this.shortcut,
          link: this.link,
        });
        this.shortcut = "";
        this.link = "";

        // TODO: Show sucessfull, and display url. (High priority)
        // Like localhost:3000/apples
        // Or   cp4.goog.press/apples
      } catch (error) {
        console.log(error);
      }
    },

    // TODO: Maybe implement delete, maybe not. We would need like an admin page.
    async deleteShortcut(ticket) {
      try {
        let response = axios.delete("/upload" + this.shortcut);
      } catch (error) {
        console.log(error);
      }
    },
    login() {
        this.registerationForm=false;
        this.showForm=true;
    },
    close() {
        this.showForm=false;
        this.registerationForm=false;
    },
    register() {
        this.registerationForm=true;
    },
  }
});
