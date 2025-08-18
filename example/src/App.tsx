import { useState, useRef } from 'react'
import { ZBDRamp, type ZBDRampRef, EnvironmentEnum } from '@zbdpay/ramp-react'

interface FormData {
  apiKey: string;
  environment: EnvironmentEnum;
  email: string;
  destination: string;
  quoteCurrency: string;
  baseCurrency: string;
  webhookUrl: string;
  referenceId: string;
}

const App = () => {
  const [sessionToken, setSessionToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRamp, setShowRamp] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    apiKey: '',
    environment: EnvironmentEnum.X1,
    email: '',
    destination: '',
    quoteCurrency: 'USD',
    baseCurrency: 'BTC',
    webhookUrl: 'https://webhook.site/79f9c0fa-8cfa-4762-9c28-e94290e8c2e1',
    referenceId: ''
  })

  const rampRef = useRef<ZBDRampRef>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const createSessionToken = async () => {
    const { apiKey, environment, email, destination, quoteCurrency, baseCurrency, webhookUrl, referenceId } = formData

    if (!apiKey || !email || !destination) {
      alert('Please fill in API Key, Email, and Destination fields')
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = environment === EnvironmentEnum.Production
        ? 'https://api.zbdpay.com/v1/ramp-widget'
        : `https://${environment}.zbdpay.com/api/v1/ramp-widget`

      const requestBody = {
        email,
        quote_currency: quoteCurrency,
        base_currency: baseCurrency,
        destination,
        webhook_url: webhookUrl,
        ...(referenceId && { reference_id: referenceId }),
        metadata: {
          created_from: 'ramp-react-example',
          environment,
        },
      }

      console.log('Creating session with:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Session created:', data)

      const token = data.data.session_token

      if (token) {
        setSessionToken(token)
        setShowRamp(true)
      } else {
        throw new Error('No session token found in API response')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert(`Error creating session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (data: any) => {
    console.log('Payment Success:', data)
    alert('Payment completed successfully!')
  }

  const handleError = (error: any) => {
    console.error('Payment Error:', error)
    alert(`Payment error: ${error.message}`)
  }

  const closeRamp = () => {
    if (rampRef.current) {
      rampRef.current.unmount()
    }
    setShowRamp(false)
    setSessionToken('')
  }

  return (
    <div className="container">
      <h1>ZBD Ramp - React Example</h1>
      
      <div className="main-layout">
        <div className="left-panel">
          <div className="form-section">
            <h3>Create Session Token</h3>
            
            <div>
              <label htmlFor="apiKey">API Key</label>
              <input
                type="text"
                id="apiKey"
                placeholder="Enter your ZBD API Key"
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="environment">Environment</label>
              <select
                id="environment"
                value={formData.environment}
                onChange={(e) => handleInputChange('environment', e.target.value as EnvironmentEnum)}
              >
                <option value={EnvironmentEnum.Production}>Production</option>
                <option value={EnvironmentEnum.X1}>X1 (Sandbox)</option>
                <option value={EnvironmentEnum.X2}>X2 (Sandbox)</option>
                <option value={EnvironmentEnum.Voltorb}>Voltorb (Sandbox)</option>
              </select>
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="destination">Destination</label>
              <input
                type="text"
                id="destination"
                placeholder="Lightning address or username"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="quoteCurrency">Quote Currency</label>
              <select
                id="quoteCurrency"
                value={formData.quoteCurrency}
                onChange={(e) => handleInputChange('quoteCurrency', e.target.value)}
              >
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label htmlFor="baseCurrency">Base Currency</label>
              <select
                id="baseCurrency"
                value={formData.baseCurrency}
                onChange={(e) => handleInputChange('baseCurrency', e.target.value)}
              >
                <option value="BTC">BTC</option>
              </select>
            </div>

            <div>
              <label htmlFor="webhookUrl">Webhook URL</label>
              <input
                type="text"
                id="webhookUrl"
                placeholder="https://webhook.site/your-unique-id"
                value={formData.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="referenceId">Reference ID (optional)</label>
              <input
                type="text"
                id="referenceId"
                placeholder="Your reference ID"
                value={formData.referenceId}
                onChange={(e) => handleInputChange('referenceId', e.target.value)}
              />
            </div>

            <div className="form-row">
              <button
                onClick={createSessionToken}
                disabled={isLoading || showRamp}
                style={{ background: '#28a745' }}
              >
                {isLoading ? 'Creating...' : 'Create Session & Load Ramp'}
              </button>
            </div>

            <div className="form-row">
              <button
                onClick={closeRamp}
                disabled={!showRamp}
                style={{ background: '#dc3545' }}
              >
                Close Ramp
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="ramp-container">
            {showRamp && sessionToken && (
              <ZBDRamp
                ref={rampRef}
                sessionToken={sessionToken}
                environment={formData.environment}
                onReady={() => console.log('Widget ready')}
                onSuccess={handleSuccess}
                onError={handleError}
                onStepChange={(step) => console.log('Step:', step)}
                onLog={(logData) => console.log('Log:', logData)}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App