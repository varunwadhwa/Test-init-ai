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
	console.log('in demographics extract info');
      let first_name = client.getFirstEntityWithRole(client.getMessagePart(), 'patient_name' , 'first_name')
      let last_name = client.getFirstEntityWithRole(client.getMessagePart(), 'patient_name' , 'last_name')

      if (first_name && last_name) {
		  console.log('got first and last name');
        client.updateConversationState({
          first_name : first_name,
          last_name : last_name
        })
      }
    }, 
	  
    satisfied() {
      return false
    },

    prompt() {
      const conversationState = client.getConversationState()
      client.addResponse('iterate_name/wish',{patient_name:conversationState.first_name})
      client.done()
    }
  })

  client.runFlow({
    classifications: {
      'greeting/greeting_recipient':'greetingRecipient',
      'ask_identity/human':'humanIdentity',
      'provide_demographic_details/Name':'saveDemographicDetails'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
	  greetingRecipient : [greetingRecipient],	
	  humanIdentity : [humanIdentity],
	  saveDemographicDetails : [saveDemographicDetails],
      main: 'onboarding',
      onboarding: [sayHello],
      end: [untrained],
    },
  })
}
