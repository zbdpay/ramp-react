# @zbdpay/ramp-react

React wrapper for ZBD Ramp widget that enables Bitcoin Lightning Network payments in React applications.

## TL;DR

```bash
npm install @zbdpay/ramp-react
```

```tsx
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react';

<ZBDRamp
  sessionToken="your-session-token"
  environment={EnvironmentEnum.Production}
  onSuccess={(data) => console.log('Success:', data)}
  onError={(error) => console.error('Error:', error)}
/>
```

## Features

- ✅ **React Optimized**: Built specifically for React with hooks and components
- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **Ref API**: Access to underlying ramp instance methods via React refs
- ✅ **Hook Support**: `useZBDRamp` hook for programmatic usage
- ✅ **Environment Support**: Production and sandbox environments (x1, x2, voltorb)
- ✅ **Session Token Based**: Uses secure session tokens for authentication

## Installation

```bash
npm install @zbdpay/ramp-react
# or
yarn add @zbdpay/ramp-react
# or
pnpm add @zbdpay/ramp-react
```

## Quick Start

### 1. Create Session Token

First, create a session token using the ZBD API:

```javascript
const response = await fetch('https://api.zbdpay.com/v1/ramp-widget', {
  method: 'POST',
  headers: {
    'apikey': 'your-zbd-api-key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    destination: 'lightning-address-or-username',
    quote_currency: 'USD',
    base_currency: 'BTC',
    webhook_url: 'https://your-webhook-url.com',
  }),
});

const { data } = await response.json();
const sessionToken = data.session_token;
```

### 2. Use ZBDRamp Component

```tsx
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react';

function App() {
  const handleSuccess = (data) => {
    console.log('Payment successful:', data);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  return (
    <ZBDRamp
      sessionToken="your-session-token"
      environment={EnvironmentEnum.Production}
      onSuccess={handleSuccess}
      onError={handleError}
      style={{ width: '100%', height: '600px' }}
    />
  );
}
```

## Complete Example

Check out the [example app](./example) for a full implementation with session token creation:

```bash
cd ramp-react/example
npm install
npm run dev
```

The example includes:
- Session token creation form
- Environment selection
- Complete ZBD Ramp integration
- Error handling and callbacks

## API Reference

### ZBDRamp Component

React component that renders the ZBD Ramp widget.

#### Props

```tsx
interface ZBDRampProps {
  sessionToken: string;                      // Required: Session token from ZBD API
  environment?: EnvironmentEnum;             // Default: EnvironmentEnum.Production
  width?: string | number;                   // Default: '100%'
  height?: string | number;                  // Default: '600px'
  className?: string;                        // CSS class for container
  style?: React.CSSProperties;              // Inline styles for container
  
  // Callbacks
  onSuccess?: (data: any) => void;           // Payment successful
  onError?: (error: RampError) => void;      // Error occurred
  onStepChange?: (step: string) => void;     // User navigated to different step
  onLog?: (log: RampLog) => void;           // Debug/info logging
  onReady?: () => void;                      // Widget fully loaded
  onClose?: () => void;                      // User closed widget
}
```

#### Environment Enum

```tsx
enum EnvironmentEnum {
  Production = 'production',
  X1 = 'x1',
  X2 = 'x2', 
  Voltorb = 'voltorb',
}
```

#### Ref API

```tsx
interface ZBDRampRef {
  mount: (container?: HTMLElement | string) => void;
  unmount: () => void;
  destroy: () => void;
}
```

### useZBDRamp Hook

Hook for creating and managing ZBD Ramp instances programmatically.

```tsx
const { createInstance, destroyInstance, instance } = useZBDRamp(options);
```

## Examples

### Basic Component

```tsx
import React from 'react';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react';

function PaymentWidget({ sessionToken }) {
  const handleSuccess = (data: any) => {
    console.log('Payment successful:', data);
    // Handle successful payment
  };

  const handleError = (error: any) => {
    console.error('Payment error:', error);
    // Handle error
  };

  return (
    <div className="payment-container">
      <h1>Make a Payment</h1>
      <ZBDRamp
        sessionToken={sessionToken}
        environment={EnvironmentEnum.Production}
        onSuccess={handleSuccess}
        onError={handleError}
        style={{ 
          width: '100%', 
          height: '600px',
          border: '1px solid #ddd', 
          borderRadius: '8px' 
        }}
      />
    </div>
  );
}
```

### With Ref for Control

```tsx
import React, { useRef } from 'react';
import { ZBDRamp, EnvironmentEnum, type ZBDRampRef } from '@zbdpay/ramp-react';

function ControlledPayment({ sessionToken }) {
  const rampRef = useRef<ZBDRampRef>(null);

  const closeWidget = () => {
    rampRef.current?.unmount();
  };

  return (
    <div>
      <button onClick={closeWidget}>Close Widget</button>
      
      <ZBDRamp
        ref={rampRef}
        sessionToken={sessionToken}
        environment={EnvironmentEnum.X1}
        onSuccess={(data) => console.log('Success:', data)}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

### Using the Hook

```tsx
import React, { useState } from 'react';
import { useZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react';

function HookExample({ sessionToken }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { createInstance, destroyInstance } = useZBDRamp({
    sessionToken,
    environment: EnvironmentEnum.Production,
    container: '#ramp-container',
    onSuccess: (data) => {
      console.log('Payment successful:', data);
      setIsOpen(false);
    },
    onClose: () => {
      setIsOpen(false);
    },
  });

  const openRamp = () => {
    setIsOpen(true);
    createInstance();
  };

  const closeRamp = () => {
    setIsOpen(false);
    destroyInstance();
  };

  return (
    <div>
      <button onClick={openRamp}>Open Payment</button>
      {isOpen && (
        <div>
          <button onClick={closeRamp}>Close</button>
          <div id="ramp-container" style={{ width: '100%', height: '600px' }} />
        </div>
      )}
    </div>
  );
}
```

### Error Handling

```tsx
import React, { useState } from 'react';
import { ZBDRamp, EnvironmentEnum, type RampError } from '@zbdpay/ramp-react';

function PaymentWithErrorHandling({ sessionToken }) {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: RampError) => {
    switch (error.code) {
      case 'INVALID_CONFIG':
        setError('Configuration error. Please check your settings.');
        break;
      case 'NETWORK_ERROR':
        setError('Network error. Please check your connection.');
        break;
      case 'PAYMENT_FAILED':
        setError('Payment failed. Please try again.');
        break;
      default:
        setError('An unexpected error occurred.');
    }
  };

  const clearError = () => setError(null);

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
      
      <ZBDRamp
        sessionToken={sessionToken}
        environment={EnvironmentEnum.Production}
        onSuccess={() => setError(null)}
        onError={handleError}
      />
    </div>
  );
}
```

### Session Token Creation Example

```tsx
import React, { useState } from 'react';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react';

function SessionTokenExample() {
  const [sessionToken, setSessionToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.zbdpay.com/v1/ramp-widget', {
        method: 'POST',
        headers: {
          'apikey': 'your-zbd-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          destination: 'lightning-address',
          quote_currency: 'USD',
          base_currency: 'BTC',
          webhook_url: 'https://your-webhook.com',
        }),
      });

      const { data } = await response.json();
      setSessionToken(data.session_token);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!sessionToken ? (
        <button onClick={createSession} disabled={isLoading}>
          {isLoading ? 'Creating Session...' : 'Create Session'}
        </button>
      ) : (
        <ZBDRamp
          sessionToken={sessionToken}
          environment={EnvironmentEnum.Production}
          onSuccess={(data) => console.log('Success:', data)}
        />
      )}
    </div>
  );
}
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```tsx
import type {
  ZBDRampProps,
  ZBDRampRef,
  RampConfig,
  RampCallbacks,
  RampOptions,
  RampError,
  RampLog,
  RampInstance,
  PostMessageData,
  EnvironmentEnum,
} from '@zbdpay/ramp-react';
```

## Related Packages

- **Core**: [`@zbdpay/ramp-ts`](https://www.npmjs.com/package/@zbdpay/ramp-ts) - Core TypeScript/JavaScript package
- **React Native**: [`@zbdpay/ramp-react-native`](https://www.npmjs.com/package/@zbdpay/ramp-react-native)
- **Flutter**: [`zbd_ramp_flutter`](https://pub.dev/packages/zbd_ramp_flutter)

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email dev@zbdpay.com or create an issue on GitHub.