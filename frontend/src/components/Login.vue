<template>
    <div class="container">
      <div class="inner-container">
        <div v-if="!loading" class="heading">This page requires web3 login</div>
        <div v-if="loading" class="heading">Loading...</div>
        <div class="input-container">
          <button class="button" @click="login()">Sign in with Metamask</button>
        </div>
      </div>
    </div>
</template>

<script>
  import Web3 from "web3"
  import axios from 'axios'
  export default {
    name: "Login",
    data: function () {
      return {
        loading: false,
      }
    },
    methods: {
      async login() {
        if(this.loading) return

        if (!window.ethereum) {
          alert('You need Metamask to use this site...')
          return
        }
        let accountList = await window.ethereum.request({method: 'eth_requestAccounts'});
        let address = accountList[0]
        let nonce = `I want to log in to sound9 with wallet: ${address} and rnd: ${Math.random()}`

        let web3 = new Web3(window.ethereum);
        let signedMessage = await web3.eth.personal.sign(nonce, address, 'password')
        try{
          await axios.post('/api/login', {
            signedMessage: signedMessage,
            nonce: nonce
          })
          await this.$router.push('/')
        } catch (ex){
          alert('Sorry but something failed logging you in 🤔')
        } finally {
          this.loading = false
        }
      },
    }
  }
</script>

<style scoped>
  .container{
    margin: 50px auto;
    width: 100%;
    padding: 10px;
    background-color: white;
    box-shadow: 0 4px 2px -2px rgba(0,0,0,0.4);
    max-width: 50%;
  }
  .heading{
    font-size: 20px;
    font-weight: bold;
  }
  .inner-container{
    text-align: center;
  }
  .button{
    position: relative;
    width: 250px;
    outline: none;
    border: none;
    border-radius: 15px;
    padding: 10px;
    margin: 20px auto;
    border-bottom: 1px solid #dfdfdf;
    cursor:pointer;
  }

  @media screen and (max-width: 992px) {
    .container {
      width: 100%;
    }
    .button{
      width: 100%;
    }
  }
</style>
