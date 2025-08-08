import { createRamp } from '@zbdpay/ramp-ts';
import type { RampInstance, RampOptions } from '@zbdpay/ramp-ts';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface ZBDRampProps extends Omit<RampOptions, 'container'> {
  className?: string;
  style?: React.CSSProperties;
}

export interface ZBDRampRef extends RampInstance {}

export const ZBDRamp = forwardRef<ZBDRampRef, ZBDRampProps>(({ className, style, ...rampOptions }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rampInstanceRef = useRef<RampInstance | null>(null);

  const createRampInstance = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up existing instance
    if (rampInstanceRef.current) {
      rampInstanceRef.current.destroy();
    }

    // Create new instance
    rampInstanceRef.current = createRamp({
      ...rampOptions,
      container: containerRef.current,
    });

    rampInstanceRef.current.mount();
  }, [rampOptions]);

  useEffect(() => {
    createRampInstance();

    return () => {
      if (rampInstanceRef.current) {
        rampInstanceRef.current.destroy();
        rampInstanceRef.current = null;
      }
    };
  }, [createRampInstance]);

  // Expose instance methods via ref
  useImperativeHandle(
    ref,
    () => ({
      mount: (container?: HTMLElement | string) => {
        rampInstanceRef.current?.mount(container);
      },
      unmount: () => {
        rampInstanceRef.current?.unmount();
      },
      destroy: () => {
        rampInstanceRef.current?.destroy();
      },
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: rampOptions.width || '100%',
        height: rampOptions.height || '100%',
        ...style,
      }}
    />
  );
});

ZBDRamp.displayName = 'ZBDRamp';

export const useZBDRamp = (options: RampOptions) => {
  const rampInstanceRef = useRef<RampInstance | null>(null);

  const createInstance = useCallback(() => {
    if (rampInstanceRef.current) {
      rampInstanceRef.current.destroy();
    }
    rampInstanceRef.current = createRamp(options);
    return rampInstanceRef.current;
  }, [options]);

  const destroyInstance = useCallback(() => {
    if (rampInstanceRef.current) {
      rampInstanceRef.current.destroy();
      rampInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyInstance();
    };
  }, [destroyInstance]);

  return {
    createInstance,
    destroyInstance,
    instance: rampInstanceRef.current,
  };
};

// Re-export types from core package
export type {
  RampConfig,
  RampCallbacks,
  RampOptions,
  RampError,
  RampLog,
  RampInstance,
  PostMessageData,
} from '@zbdpay/ramp-ts';

export { EnvironmentEnum } from '@zbdpay/ramp-ts';
