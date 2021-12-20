<template>
  <div>
    <div @click="goHome()" class="header-container">
      <div class="header-progress" :style="{ backgroundColor: progressColor, width: progressPercent + '%' }"></div>
      <div class="header-text" v-if="progressPercent < 100">UPLOAD MUSIC</div>
      <div class="header-text" v-if="progressPercent === 100">MUSIC UPLOADED</div>
    </div>

    <div class="tab-container-upper">
      <div class="left">{{fileList.length}} files found</div>
      <div class="center">{{audioFiles.length}} audio files</div>
      <div class="right">{{uploaded}} uploaded</div>
    </div>

    <div class="main-container">
      <div class="upload-box" v-if="!audioFiles || audioFiles.length === 0" >
        <div class="dashed" @click="clickFileInput()">
          <img src="../../public/icons8_upload_to_ftp_1.svg" class="upload-image"/>
          <div class="icon-text">Select a folder to upload</div>
          <input id="file-input" type="file" webkitdirectory multiple class="upload-input" @change="uploadFiles()"/>
        </div>
      </div>

      <div v-if="audioFiles && audioFiles.length > 0" class="file-container">
        <div class="list-item" v-for="file in page" :class="{ uploaded: file.uploaded }">
          <div class="file-name" v-if="!editMode">
            <div class="name">{{ getDisplayName(file) }}</div>
            <div class="subname">{{ getAlbum(file) }}</div>
          </div>
          <div class="file-name-edit" v-if="editMode">
            <div class="subtext">{{file.tags.originalFileName}} - {{file.tags.fileType}}</div>
            <input type="text" class="year" v-model="file.tags.year"/>
            <input type="text" v-model="file.tags.album"/>
            <input type="text" v-model="file.tags.artist"/>
            <input type="text" v-model="file.tags.title"/>
          </div>
          <div class="delete" @click="removeFile(file)"><img src="../../public/icons8_delete_trash_1.svg"/></div>
        </div>
      </div>
    </div>

    <div class="tab-container-lower">
      <div class="left edit" @click="editMode = !editMode" v-bind:class="{ active: editMode }">
        Edit ID3 tags <img src="../../public/icons8_edit_1.svg"/>
      </div>
      <div class="center" @click="uploadFiles()">
        <span>Upload</span><img src="../../public/icons8_upload.svg">
      </div>
      <div class="right page-selector">
        <img src="../../public/icons8_chevron_left_1.svg" @click="previousPage()"/>
        <span>{{currentPageVisual}} / {{pageCount}}</span>
        <img src="../../public/icons8_chevron_right_1.svg" @click="nextPage()"/>
      </div>
    </div>

  </div>
</template>

<script>
  import jsmediatags from 'jsmediatags-web'
  import axios from 'axios'
  export default {
    name: "Uploader",
    data: function(){
      return {
        fileList: [],
        uploaded: 0,
        editMode: false,
        progressPercent: 0,
        currentPage: 0,
        totalPages: 0,
        pageSize: 15
      }
    },
    computed: {
      progressColor: function(){
        return this.progressPercent === 100 ? '#2db8a275' : '#ab532675'
      },
      audioFiles: function () {
        return this.fileList.filter(file =>
          file.tags.fileType === 'mp3' ||
          file.tags.fileType === 'wav' ||
          file.tags.fileType === 'flac' ||
          file.tags.fileType === 'wma' ||
          file.tags.fileType === 'webm' ||
          file.tags.fileType === 'mp4' ||
          file.tags.fileType === 'aac' // Probable formats
        )
      },
      page: function () {
        let start = this.currentPage * this.pageSize
        let end = start + this.pageSize
        return this.audioFiles.slice(start, end)
      },
      pageCount(){
        if(!this.audioFiles) return 0
        let l = this.audioFiles.length
        let s = this.pageSize
        return Math.ceil(l/s)
      },
      currentPageVisual: function () {
        if(this.pageCount < 1) return 0
        return this.currentPage+1
      }
    },
    mounted: function () {
      let fileInput = document.getElementById('file-input');
      this.fileList = [];

      fileInput.addEventListener('change', (evnt) => {
        this.fileList = [];
        for (let i = 0; i < fileInput.files.length; i++) {
          let file = fileInput.files[i]
          jsmediatags.read(file, {
            onSuccess: (tags) => {
              let taggar = {
                title: tags.tags.title,
                artist: tags.tags.artist,
                album: tags.tags.album,
                year: tags.tags.year,
                originalFileName: file.name,
                fileType: file.name.split('.').pop()
              }
              if(!taggar.title) taggar.title = file.name.substring(0, file.name.lastIndexOf('.'))
              this.fileList.push({file: file, tags: taggar});
            },
            onError: (error) => {
              let album = 'unknown'
              let artist = 'unknown'
              let title = file.name.substring(0, file.name.lastIndexOf('.'))
              let pathArr = (file.webkitRelativePath || '').split('/')

              if (pathArr.length >= 3) artist = pathArr[pathArr.length-3];
              if (pathArr.length >= 2) album = pathArr[pathArr.length-2];
              if (pathArr.length >= 1) title = pathArr[pathArr.length-1].substring(0, pathArr[pathArr.length-1].lastIndexOf('.'))

              let taggar = {
                title: title,
                artist: artist,
                album: album,
                year: null,
                originalFileName: file.name,
                fileType: file.name.split('.').pop()
              }
              this.fileList.push({file: file, tags: taggar});
            }
          })
        }
      });
    },
    methods: {
      uploadFiles: async function () {
        let errors = []
        for (let i = 0; i < this.audioFiles.length; i++) {
          let obj = this.audioFiles[i]
          try{
            await this.sendFile(obj.file, obj.tags);
          } catch (e) {
            errors.push(obj.tags.originalFileName, e)
          }
          this.uploaded = i+1
          this.progressPercent = Math.ceil(this.uploaded*100/this.audioFiles.length)
          obj.uploaded = true
        }
        if(errors.length > 0){
          alert(`There were some errors (${errors.length}) uploading the files. Details have been logged to console`)
        }
      },
      sendFile: async function(file, tags) {
        let stags = this.poorlySanatizeTags(tags)
        let formData = new FormData();
        formData.set('file', file, JSON.stringify(stags));
        await this.$axios.post('api/library/new', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      },
      poorlySanatizeTags(tags){
        tags.title = !tags.title ? null : decodeURI(encodeURI(tags.title)).replace(/[\\"]/g, '')
        tags.artist = !tags.artist ? null : decodeURI(encodeURI(tags.artist)).replace(/[\\"]/g, '')
        tags.album = !tags.album ? null : decodeURI(encodeURI(tags.album)).replace(/[\\"]/g, '')
        tags.year = !tags.year ? null : decodeURI(encodeURI(tags.year)).replace(/[\\"]/g, '')
        tags.originalFileName = !tags.originalFileName ? null : decodeURI(encodeURI(tags.originalFileName)).replace(/[\\"]/g, '')
        tags.fileType = !tags.fileType ? null : decodeURI(encodeURI(tags.fileType)).replace(/[\\"]/g, '')
        return tags
      },
      removeFile: function(file){
        let index = this.fileList.findIndex(x => x.tags.originalFileName === file.tags.originalFileName)
        this.fileList.splice(index, 1)
      },
      getDisplayName: function (file) {
        return `${file.tags.artist} - ${file.tags.title}`
      },
      getAlbum: function (file) {
        return `${file.tags.album} - (${file.tags.year})`
      },
      clickFileInput: function () {
        document.getElementById('file-input').click()
      },
      previousPage : function () {
        if(this.currentPage === 0) return
        this.currentPage--
      },
      nextPage: function () {
        if(this.currentPageVisual === this.pageCount) return;
        this.currentPage++
      },
      goHome(){
        this.$router.push('/')
      }
    }
  }
</script>

<style scoped>
  .header-container{
    width: 100%;
    height: 100px;
    position: relative;
    cursor: pointer;
  }
  .header-text{
    color: #f1f3f4;
    text-align: center;
    position: relative;
    bottom:5px;
    font-size: 80px;
  }
  .header-progress{
    position: absolute;
    height: 120px;
    z-index: -1;
    bottom: 0;
  }
  .tab-container-upper{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
    position: sticky;
    top:0;
    z-index: 10;
    box-shadow: 0 4px 2px -2px rgba(0,0,0,0.4);
  }
  .tab-container-upper .center{
    width: 50%;
    text-align: center;
  }
  .tab-container-lower{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
    box-shadow: 0px -6px 6px -8px rgba(0,0,0,0.75);
  }
  .tab-container-lower .center{
    width: 50%;
    text-align: center;
    cursor: pointer;
  }
  .tab-container-lower .center img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .tab-container-lower .center  span{
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 5px;
  }
  .upload-box{
    background-color: #fafafa;
    width: 98%;
    margin: auto;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .file-name-edit{
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .file-container{
    padding: 0 5px;
  }
  .file-container .subtext{
    font-size: 12px;
  }
  .file-container input{
    margin-right: 5px;
    border-radius: 4px;
    border: 1px solid #bfbfbf;
    padding: 3px;
  }
  .list-item{
    background-color: #ffffff;
    border-bottom: 1px solid #dfdfdf;
    position: relative;
  }
  .list-item.uploaded{
    background-color: #2db8a2;
  }
  .list-item:hover{
    background-color: #bfbfbf;
    cursor: pointer;
  }
  .list-item .delete{
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: pointer;
  }
  .list-item .delete img {
    height: 20px;
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
  .dashed{
    height: 300px;
    width: 80%;
    margin: auto;
    border: dashed 10px #9a9a9a;
    position: relative;
    cursor: pointer;
  }
  .upload-image{
    margin: 20% auto auto;
    height: 70px;
    display: flex;
  }
  .icon-text{
    width: 100%;
    text-align: center;
  }
  .upload-input{
    visibility: hidden;
  }
  .page-selector img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .page-selector span{
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 5px;
  }
  .edit img{
    height: 20px;
    vertical-align: bottom;
    cursor: pointer;
  }
  .edit{
    cursor: pointer;
  }
  .edit.active{
    color: #0e88ff;
  }

  @media only screen and (max-width: 750px) {
    .header-text{
      font-size: 50px;
      bottom: -30px;
    }
    .tab-container-upper .center {
      width: 40%;
    }
    .tab-container-lower .center {
      width: 40%;
    }
  }

  @media only screen and (max-width: 500px) {
    .header-text{
      font-size: 30px;
      bottom: -30px;
    }
    .tab-container-upper .center {
      width: 40%;
    }
    .tab-container-lower .center {
      width: 40%;
    }
  }

</style>
