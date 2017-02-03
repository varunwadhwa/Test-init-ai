const restify = require('restify')
const InitClient = require('initai-node')
const projectLogicScript = require('./behavior/scripts')

const server = restify.createServer()
const PORT = process.env.PORT || 4044

server.use(restify.bodyParser())

/**
* Send the result of the logic invoation to Init.ai
**/
function sendLogicResult(invocationPayload, result) {
  const invocationData = invocationPayload.invocation_data
  const client = restify.createClient({url: invocationData.api.base_url})

  const requestConfig = {
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${invocationData.auth_token}`,
      'content-type': 'application/json',
    },
    method: 'POST',
    path: 'api/v1/remote/logic/invocations/${invocationData.invocation_id}/result',
  }

  const resultPayload = {
    invocation: {
      invocation_id: invocationData.invocation_id,
      app_id: invocationPayload.current_application.id,
      app_user_id: Object.keys(invocationPayload.users)[0],
    },
    result: result,
  }

  client.post(requestConfig, (err, req) => {
    if (err) {
      console.error(err)
    }

    req.on('result', (err, res) => {
      res.body = ''
      res.setEncoding('utf8')

      res.on('data', (chunk) => {
        res.body += chunk
      })

      res.on('end', () => {
        console.log('Result sent successfully ' +res.body);
      })
    })

    req.write(JSON.stringify(resultPayload))
    req.end()
  })
}


/**
 * Add a POST request handler for webhook invocations
 */
server.post('/', (req, res, next) => {
  const eventType = req.body.event_type
  const eventData = req.body.data
  console.log('event type is' + eventType);
  console.log('event payload is' + eventData.payload);

  // Handle the LogicInvocation event type
  if (eventType === 'LogicInvocation') {
    // This is the payload you will need to provide the Init.ai Node client
    console.log(eventData.payload)
    const initNodeClient = InitClient.create(eventData, {
      succeed(result) {
        sendLogicResult(eventData.payload, result)
      }
    })
    projectLogicScript.handle(initNodeClient)
  }

  // Immediately return a 200 to acknowledge receipt of the Webhook
  res.send(200)
})

/**
 * Start the server on the configured port (default is 4044)
 */
server.listen(PORT, () => {
  console.log('%s listening at %s', server.name, server.url)
})
