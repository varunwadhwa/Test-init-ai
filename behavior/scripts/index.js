'use strict'

exports.handle = (client) => {
  // Create steps
  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('welcome')
      client.addResponse('provide/documentation', {
        documentation_link: 'http://docs.init.ai',
      })
      client.addResponse('provide/instructions')

      client.updateConversationState({
        helloSent: true
      })

      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('apology/untrained')
      client.done()
    }
  })
  
  const greetingRecipient = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('greeting/sarcasm_reply')
      client.done()
    }
  })
  
  const humanIdentity = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('provide_identity_information/affirmative')
      client.done()
    }
  })
  
  const saveDemographicDetails = client.createStep({
	extractInfo() {
      let first_name = client.getFirstEntityWithRole(client.getMessagePart(), 'patient_name' , 'first_name')
      let last_name = client.getFirstEntityWithRole(client.getMessagePart(), 'patient_name' , 'last_name')
      if (first_name) {
        client.updateConversationState({
          first_name : first_name
        })
      }
    }, 
	  
    satisfied() {
      return Boolean(!(client.getConversationState().first_name))
    },

    prompt() {
      let data = client.getConversationState()
      client.addResponse('iterate_name/congratulatory_msg',{'patient_name#first_name' : data.first_name.value})
      client.addResponse('message/assist_get_data_msg');
      client.addResponse('ask_vital/height');
      client.expect('saveHeight',['provide_vital_value/height'])
      client.done()
    }
  })

  const sendInitialOnboardGreeting = function (eventType, payload) {
    client.addTextResponse('Welcome to Siya , your very own personal assistant.');
    let data = client.getConversationState()
    if(!(data.first_name && data.last_name)){
      client.addResponse('ask_name/patient_name');
      client.expect('saveDemographicDetails',['provide_name/patient_name','provide_name/patient_name'])
    }
    //show patient demographics
    else{

    }
    client.done()
  }

  const saveHeight = client.createStep({
    extractInfo() {
      let height = client.getFirstEntityWithRole(client.getMessagePart(), 'vital' , 'vital_value')
      console.log('got height as' + height);
      if (height) {
        client.updateConversationState({
          height : height
        })
      }
    }, 
    
    satisfied() {
      return Boolean(client.getConversationState().weight)
    },

    prompt() {
      let weight = Boolean(client.getConversationState().weight);
      if(!weight){
        //ask for weight
        client.addResponse('ask_vital/weight')
        client.expect('saveWeight',['provide_vital_value/weight'])
      }else{
        //handle this later  
      }
    }
  })

  /*let checkVitalValue = (vitalValue) => {
    
  }
*/
  const saveWeight = client.createStep({
    extractInfo() {
      let weight = client.getFirstEntityWithRole(client.getMessagePart(), 'vital' , 'weight')
      if (weight) {
        client.updateConversationState({
          weight : weight
        })
      }
    }, 
    
    satisfied() {
      return Boolean(client.getConversationState().weight)
    },

    prompt() {
      let weight = Boolean(client.getConversationState().weight);
      let height = Boolean(client.getConversationState().height);
      if(weight && height){
        //calculate BMI
        let BMI,data;
        BMI = weight/(height*height);
        data = {'patient_name#first_name' : first_name.value,
        'vital#vital_category' : 'BMI',
        'vital#vital_value' : BMI,
        'vital#vital_ideal_value' : '65',
        'vital#vital_unit' : 'kg'
        }
        client.addResponse('provide_vital_value/bmi_value_range_text_normal',data)
      }else{
        //handle this later  
      }
    }
  })

  client.runFlow({
    eventHandlers: {   
      'greeting:onboarding:initial': sendInitialOnboardGreeting
    }, 
    classifications: {
      'greeting/greeting_recipient':'greetingRecipient',
      'ask_identity/human':'humanIdentity',
      'provide_name/patient_name':'saveDemographicDetails',
      'provide_name/patient_name':'saveDemographicDetails',
      'provide_vital_value/height':'saveHeight'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
      greetingRecipient : [greetingRecipient],	
      humanIdentity : [humanIdentity],
      saveDemographicDetails : [saveDemographicDetails],
      saveHeight : [saveHeight],
      saveWeight : [saveWeight],
      main: 'onboarding',
      onboarding: [sayHello],
      end: [untrained],
    },
  })
}
