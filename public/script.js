var app = new Vue({
    el: '#app',
    data: {
        shortcut: '',
        link: '',
        showForm: false,
        registerationForm: false,
        showSignoutForm: false,
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        user: null,
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
        toggleForm() {
            this.email = '';
            this.username = '';
            this.password = '';
            this.confirmPassword = '';
            this.showForm = false;
            this.registerationForm = false;
        },
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
                // close the dialog
                this.close();
            } catch (error) {
                this.error = error.response.data.message;
            }
        },
        async signout() {
            try {
                let response = await axios.delete("/api/users");
                this.user = null;
            } catch (error) {
                // don't worry about it
            }

            this.showSignoutForm = false;
        },
        async getUser() {
            try {
                let response = await axios.get("/api/users");
                this.user = response.data;
            } catch (error) {
                // Not logged in. That's OK!
            }
        },
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
        }
    }
});
