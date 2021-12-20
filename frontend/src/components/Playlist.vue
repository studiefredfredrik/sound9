<template>
    <div>
      <div>
        <Visualizer class="visualizer-container"></Visualizer>

        <div class="sticky">
            <TabContainer :total-tab-count="totalTabCount"
                          :tabs="tabs"
                          @tab-changed="tabChanged"
                          :current-tab="currentTab">
            </TabContainer>
        </div>

        <FileContainer @play-file="play"
                       @delete-file="deleteFile"
                       :files="filesInTab"
                       :current-file="currentFile"
                       :edit-mode="editMode"
                       :edit-mode-loading="editModeLoading">
        </FileContainer>

        <div color="#f1f3f4" class="player-container">
          <div md12 v-show="showSearch" class="search-container">
            <input type="text" label="Search for a file:"
                          ref="search"
                          placeholder="Search for artist, title or album..."
                          class="search-input"
                          v-model="searchString"
                          @keyup="searchChanged(true)">
          </div>
          <Player @play-file="play"></Player>
          <Footer @search-click="searchClick"
                  @playlist-changed="playlistChanged()"
                  @add-to-favorites="addToFavorites()"
                  @toggle-edit-mode="toggleEditMode()"
          >
          </Footer>
          <BassBooster></BassBooster>
          <ShuffleButton></ShuffleButton>
        </div>
      </div>
    </div>
</template>

<script>
  import store from '@/data/store'
  import Footer from '@/components/Footer'
  import TabContainer from '@/components/playlist/TabContainer'
  import FileContainer from '@/components/playlist/FileContainer'
  import Visualizer from '@/components/Visualizer'
  import Player from '@/components/Player'
  import BassBooster from "@/components/BassBooster"
  import ShuffleButton from "@/components/ShuffleButton"

  export default {
    name: "Playlist",
    data: function () {
      return {
        currentTab: 0,
        numberPrTab: 50,
        tabsToShow: 5,
        // Private
        searchString: null,
        playing: false,
        showSearch: false,
        searchInProgress: false,
        currentSearchResult: [],
        editMode: false,
        editModeLoading: false
      }
    },
    components: {
      ShuffleButton,
      BassBooster,
      Footer,
      TabContainer,
      Visualizer,
      FileContainer,
      Player
    },
    computed: {
      filesInSearch: function () {
        return this.currentSearchResult

      },
      filesInTab: function () {
        let start = this.currentTab * this.numberPrTab
        let end = start + this.numberPrTab
        return this.filesInSearch.slice(start, end)
      },
      currentFile: function () {
        return store.state.currentFile
      },

      totalTabCount: function () {
        return Math.ceil(this.filesInSearch.length / this.numberPrTab)
      },
      tabs: function () {
        let tabCount = this.filesInSearch.length / this.numberPrTab

        let start = this.currentTab - this.tabsToShow / 2
        if (start < 0) start = 0

        let tabs = []
        for (let i = 0; i < tabCount; i++) {
          if (i < start) continue
          tabs.push(i)
          if (tabs.length >= this.tabsToShow) break
        }
        return tabs
      },

    },
    mounted: function () {
      store.state.playlists.push(
        {
          name: 'library',
          url: './api/library'
        },
        {
          name: 'favorites',
          url: './api/favorites'
        }
      )
      store.state.currentPlaylist = store.state.playlists[0]

      window.addEventListener('keydown', this.onKey)

      this.$axios.get(store.state.playlists[0].url)
        .then(response => {
          store.state.library = response.data
          store.state.files = store.state.library
          if (!store.state.files || store.state.files.length < 1) return;

          if (localStorage.getItem('last_played')) {
            let currentFile = JSON.parse(localStorage.getItem('last_played'))
            this.play(currentFile, true)
            this.$nextTick(() => {
              this.searchChanged()
            })
          } else {
            this.play(store.state.files[0], true)
            this.$nextTick(() => {
              this.searchChanged()
            })
          }
        })
      this.$axios.get(store.state.playlists[1].url)
        .then(response => {
          if (response.data.length) {
            store.state.favorites = response.data || []
          }
        })
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.onKey)
    },
    methods: {
      play(file, paused = false) {
        this.$bus.$emit('request_playFile', {file: file, paused: paused})
      },
      tabChanged(tab) {
        this.currentTab = tab
      },
      searchChanged(debounce) {
        this.searchInProgress = setTimeout(() => {
          this.currentSearchResult = store.state.files
            .filter(file => {
              if (this.searchString) {
                if (file.url.toLowerCase().includes(this.searchString.toLowerCase())) return true
                if (!file.id3) return false
                if (file.id3.artist && file.id3.artist.toLowerCase().includes(this.searchString.toLowerCase())) return true
                if (file.id3.album && file.id3.album.toLowerCase().includes(this.searchString.toLowerCase())) return true
                if (file.id3.title && file.id3.title.toLowerCase().includes(this.searchString.toLowerCase())) return true
                if (file.id3.year && file.id3.year.toLowerCase().includes(this.searchString.toLowerCase())) return true
                return false
              }
              return true
            })

          if (this.searchString) {
            this.currentTab = 0
          } else {
            this.currentTab = Math.floor(store.state.files.findIndex(x => x.url === this.currentFile.url) / this.numberPrTab)
          }
          if (this.currentTab < 0) this.currentTab = 0 // Current file is not in current playlist
        })
      },
      onKey(event) {
        if (event.key === 'f' && !this.showSearch) {
          this.showSearch = true
          this.$nextTick(() => {
            this.$refs.search.focus()
          })
          event.preventDefault()
        } else if (event.key === 'Escape' && this.showSearch) {
          this.searchClick() // leave
          event.preventDefault()
        } else if (event.key === 'Enter' && this.showSearch) {
          this.$refs.search.blur()
          event.preventDefault()
        }
      },
      searchClick() {
        this.showSearch = !this.showSearch
        if (this.showSearch) this.$nextTick(() => {
          this.$refs.search.focus()
        })
        else {
          this.searchString = ''
          this.searchChanged()
        }
      },
      addToFavorites() {
        let file = store.state.files.find(x => x.url === this.currentFile.url)
        if (store.state.favorites.findIndex(x => x.url === file.url) > -1) {
          // Should display message?
          return
        }
        store.state.favorites.push(file)
        this.$axios.put(`./api/favorites`, store.state.favorites)
          .then(response => {
            // Something later?
          })
      },
      playlistChanged() {
        if (store.state.currentPlaylist.name === 'library') {
          store.state.files = store.state.favorites
          store.state.currentPlaylist = store.state.playlists[1]
        } else {
          store.state.files = store.state.library
          store.state.currentPlaylist = store.state.playlists[0]
        }
        this.$nextTick(() => {
          this.searchChanged()
        })
      },
      toggleEditMode() {
        this.editMode = !this.editMode
      },
      deleteFile(file) {
        this.playing = false
        this.editModeLoading = true
        this.$axios.delete('/api/library', {data: {operation: 'delete-file', filename: file.url}})
          .then(() => {
            store.state.files = store.state.files.filter(function (obj) {
              return obj.url !== file.url;
            });
          })
          .catch(() => {
            alert('Operation failed')
          })
          .finally(() => {
            this.editModeLoading = false
            this.$nextTick(() => {
              this.searchChanged()
            })
          })
      },
    }
  }

</script>

<style scoped>
  .player-container{
    bottom: 0;
    position: sticky;
    background-color: #f1f3f4;
  }
  .sticky{
    position: sticky;
    top:0;
    z-index: 10;
    box-shadow: 0 4px 2px -2px rgba(0,0,0,0.4);
  }
  .visualizer-container{
    width: 100%;
    height: 200px;
  }
  .search-container{
    width: 100%;
  }
  .search-input{
    width: 100%;
    background-color: #f1f3f4;
    border: none;
    height: 50px;
    font-family: monospace;
    outline: none;
    border-bottom: 2px solid #9a9a9a;
  }
  .search-input:focus{
    border-bottom: 2px solid #696969;
  }
</style>



