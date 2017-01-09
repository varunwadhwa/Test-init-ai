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

  client.runFlow({
    classifications: {
      'greeting/greeting_recipient':'greetingRecipient',
      'ask_identity/human':'humanIdentity'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
	  greetingRecipient : [greetingRecipient],	
	  humanIdentity : [humanIdentity],
      main: 'onboarding',
      onboarding: [sayHello],
      end: [untrained],
    },
  })
}
