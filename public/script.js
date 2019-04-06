var app = new Vue({
    el: '#app',
    data: {
        shortcut: '',
        oldlink: '',
        link: '',
        showForm: false,
        registerationForm: false,
        showSignoutForm: false,
        buttonLabel: 'Create',
        update: false,
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        user: null,
        userShortcuts: null, // [{shortcut: "abc", link: "www.google.com"}, {shortcut: "123", link: "www.apple.com"}, {shortcut: "apples", link: "www.netflix.com"}],
    },
    created() {
        this.getUser();
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
        async register() {
            if (this.email === '' || this.password === '' || this.confirmPassword === '') {
                alert("Be sure the email, password, and confirm password fields are filled in.");
                return;
            } else if (this.password !== this.confirmPassword) {
                alert("Passwords don't match!");
                return;
            } else if (this.username.trim().length === 0) {
                this.username = this.email;
            }

            this.error = "";
            try {
                let response = await axios.post("/api/users", {
                    email: this.email,
                    username: this.username,
                    password: this.password
                });
                this.user = response.data;
                // close the dialog
                this.close(); // TODO: Need to figure this out.
            } catch (error) {
                this.error = error.response.data.message;
            }
        },
        async login() {
            this.error = "";
            try {
                let response = await axios.post("/api/users/login", {
                    username: this.email,
                    password: this.password
                });
                this.user = response.data;
                this.userShortcuts = this.user.shortcuts.reverse();
                // close the dialog
                this.close();
            } catch (error) {
                this.error = error.response.data.message;
                // TODO: Make nicer.
                alert("Error Logging In");
            }
        },
        async updateItem() {
            this.error = "";
            try {
                let response = await axios.put("/api/users/upload/" + this.oldlink, {
                    shortcut: this.shortcut,
                    link: this.link,
                });
                this.getUser();
            } catch (error) {
                this.error = error.response.data.message;
                // TODO: Make nicer.
                alert("Key already Exists! Try a different Key!");
            }
        },
        async signout() {
            try {
                let response = await axios.delete("/api/users");
                this.user = null;
                this.userShortcuts = null;
                this.cancel();
            } catch (error) {
                // don't worry about it
            }

            this.showSignoutForm = false;
        },
        async getUser() {
            try {
                let response = await axios.get("/api/users");
                this.user = response.data;
                this.userShortcuts = this.user.shortcuts.reverse();
            } catch (error) {
                // Not logged in. That's OK!
            }
        },
        async addShortcut() {
            if (this.update) {
                this.updateItem();
                return;
            } else {
                try {
                    if (this.user === null) {
                        // Not logged in API.
                        let response = await axios.post("/upload", {
                            shortcut: this.shortcut,
                            link: this.link,
                        });
                    } else {
                        // Logged in API.
                        let response = await axios.post("/api/users/upload", {
                            shortcut: this.shortcut,
                            link: this.link,
                        });
                    }

                    this.shortcut = "";
                    this.link = "";

                    this.getUser();
                } catch (error) {
                    console.log(error);
                    alert("Error creating shortcut!");
                }
            }
        },
        async deleteShortcut(shorty) {
            try {
                let response = await axios.delete("/api/users/upload/" + shorty);
                this.getUser();
            } catch (error) {
                console.log(error);
            }
        },
        showLogin() {
            this.registerationForm = false;
            this.showForm = true;
        },
        close() {
            this.email = '';
            this.username = '';
            this.password = '';
            this.confirmPassword = '';
            this.showForm = false;
            this.registerationForm = false;
            this.showSignoutForm = false;
        },
        showRegister() {
            this.registerationForm = true;
            this.showForm = true;
        },
        showSignout() {
            this.showSignoutForm = true;
        },
        getLink(shorturl) {
            return 'http://' + window.location.hostname + '/' + shorturl;
        },
        getShowLink(shorturl) {
            return window.location.hostname + '/' + shorturl;
        },
        selected(item) {
            this.oldlink = item.shortcut;
            this.shortcut = item.shortcut;
            this.link = item.link;
            this.buttonLabel = "Update";
            this.update = true;
        },
        cancel() {
            this.shortcut = '';
            this.link = '';
            this.buttonLabel = "Create";
            this.update = false;
            this.oldlink = '';
        },
    }
});
