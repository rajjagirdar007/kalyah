new Vue({
    el:'#app',
    data() {
      return {
        questions: {
            question1:'What kind of issue are you facing?',
            question2:'Breifly describe the issue that you are facing?',
            question3:'Where is this issue occuring?',
            question4:'How severe is this issue to you?'
            



        },  
        step:1,
        form:{
          issue:null,
          location:null,
          descrip:null,
          severity:null,
        }
      }
    },
    methods:{
      prev() {
        this.step--;
      },
      next() {
        this.step++;
      },
      
      
    }
  });