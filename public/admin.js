var app = new Vue({
  el: '#admin',
  data: {
    shortcut: '',
    link: '',
    lookups: [],
    findLookup: null,
    findShortcut: "",
    id: '',
  },
  created() {
    this.getLookups();
  },
  watch: {
    findTitle(newValue, oldValue) {
      this.suggestions = this.items.filter(item => item.title.toLowerCase().startsWith(this.findTitle.toLowerCase()));
    }
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0]
    },
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
    async getLookups() {
      try {
        let response = await axios.get("/upload");
        this.lookups = response.data;
	this.lookups.forEach(function(entry){
		console.log(entry);
		entry["id"] = entry._id;
	});
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    selectLookup(lookup) {
      this.findShortcut = "";
      this.findLookup = lookup;
    },
    async editLookup(lookup) {
      try {
        let response = await axios.put("/upload/" + lookup._id, {
          id: lookup.id,
          link: lookup.link,
        });
        this.findLookup = null;
        this.getLookups();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async deleteLookup(lookup) {
      try {
        let response = axios.delete("/upload/" + lookup._id);
        this.findLookup = null;
        this.getLookups();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
});
