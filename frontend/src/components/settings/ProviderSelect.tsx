import { ChevronDown } from 'lucide-react';
import type { LlmProvider } from '../../stores/settings-store';

type ProviderSelectProps = {
  id: string;
  value: LlmProvider;
  onChange: (value: LlmProvider) => void;
  required?: boolean;
};

export function ProviderSelect({
  id,
  value,
  onChange,
  required,
}: ProviderSelectProps) {
  const providers: { value: LlmProvider; label: string }[] = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'google', label: 'Google' },
    { value: 'anthropic', label: 'Anthropic' },
  ];

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as LlmProvider)}
        required={required}
        className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-4 text-gray-900 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-600"
      >
        {providers.map((provider) => (
          <option key={provider.value} value={provider.value}>
            {provider.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
