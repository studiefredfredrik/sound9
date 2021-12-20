<template>
  <div v-if="files && files.length > 0" class="file-container">
    <div v-for="(file, index) in files" @click="play(file, index)" :class="{ active: file.url === currentFile.url }" class="list-item">
      <div class="file-name" >
        <div class="name">{{ getDisplayName(file) }} <span v-if="editMode" class="fas fa-times delete-button" @click.stop="deleteFile(file)"></span></div>
        <div class="subname">{{ getAlbum(file) }}</div>

      </div>
    </div>
  </div>
  <div v-else class="file-container">
    <div class="list-item">
      <div class="file-name" >
        <div class="name">Nothing to show..</div>
        <div class="subname">No search results</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "FileContainer",
    props:{
      files: Array,
      currentFile: Object,
      editMode: Boolean,
      editModeLoading:  Boolean
    },
    methods:{
      getDisplayName(file){
        if(file.id3 && file.id3.artist && file.id3.title) return `${file.id3.artist} - ${file.id3.title}`
        return file.url.split('/').slice(-1)[0]
      },
      getAlbum(file){
        if(file.id3 && file.id3.album && file.id3.year) return `${file.id3.album} (${file.id3.year})`
        if(file.id3 && file.id3.album ) return `${file.id3.album}`
        return '--'
      },
      play(file, index){
        this.$emit('play-file', file);
      },
      deleteFile(file){
        let ok = confirm('Delete the file?')
        if(!ok) return
        this.$emit('delete-file', file);
      },
    }
  }
</script>

<style scoped>
  .file-container{
    padding: 0 5px;
  }
  .list-item{
    background-color: #ffffff;
    border-bottom: 1px solid #dfdfdf;
  }
  .list-item:hover{
    background-color: #bfbfbf;
    cursor: pointer;
  }
  .name{
    font-size: 16px;
    color: #505050;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: normal;
    font-weight: 600;
  }
  .subname{
    font-size: 14px;
    color: #868686;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 300;
  }
  .active{
    background: rgba(46,111,119,1);
    color: #dfdfdf;
  }
  .active .name{
    color: #ffffff;
  }
  .active .subname {
    color: #ececec;
  }
  .delete-button{
    float: right;
    margin-right: 5px;
    color: red;
  }
  .big-delete-button {
    padding-top: 20px;
    padding-bottom: 20px;
    background-color: red;
    text-align: center;
    font-size: 18px;
    color: #ffffff;
    font-style: normal;
    font-weight: 600;
  }
</style>
