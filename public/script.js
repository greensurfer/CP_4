var app = new Vue({
  el: '#app',
  data: {
    shortcut: '',
    link: '',
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
  }
});