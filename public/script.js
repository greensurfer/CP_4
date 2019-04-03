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
        user: {username: 'greensurfer'},
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
            if(this.email === '' || this.password === '' || this.confirmPassword === '') {
                alert("Be sure the email, password, and confirm password fields are filled in.");
                return;
            } else if (this.password !== this.confirmPassword) {
                alert("Passwords don't match!");
                return;
            }

            this.error = "";
            try {
                let response = await axios.post("/api/users", {
                    email:    this.email,
                    username: this.username,
                    password: this.password
                });
                this.user = response.data;
                // close the dialog
                this.toggleForm();   // TODO: Need to figure this out.
            } catch (error) {
                this.error = error.response.data.message;
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
        signout() {
            this.user = null;
            // TODO: Server backend.
        },
        showLogin() {
            this.registerationForm = false;
            this.showForm = true;
        },
        close() {
            this.showForm = false;
            this.registerationForm = false;
        },
        showRegister() {
            this.registerationForm = true;
        },
    }
});
