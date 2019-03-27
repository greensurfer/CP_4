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
            } catch (error) {
                console.log(error);
            }
        },
        async deleteShortcut(ticket) {
            try {
                let response = axios.delete("/upload" + this.shortcut);
            } catch (error) {
                console.log(error);
            }
        },
    }
});
