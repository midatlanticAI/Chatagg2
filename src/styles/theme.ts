export interface Theme {
  // Base colors
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    border: string;
  };
  
  // Message styles
  messages: {
    user: {
      background: string;
      text: string;
      border: string;
    };
    assistant: {
      openai: {
        background: string;
        text: string;
        border: string;
        label: string;
      };
      anthropic: {
        background: string;
        text: string;
        border: string;
        label: string;
      };
      gemini: {
        background: string;
        text: string;
        border: string;
        label: string;
      };
    };
  };
  
  // Input styles
  input: {
    background: string;
    text: string;
    border: string;
    placeholder: string;
    focus: string;
  };
  
  // Button styles
  buttons: {
    primary: {
      background: string;
      text: string;
      border: string;
      hover: string;
    };
    secondary: {
      background: string;
      text: string;
      border: string;
      hover: string;
    };
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    background: 'bg-gray-100',
    surface: 'bg-white',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      accent: 'text-gray-400',
    },
    border: 'border-gray-200',
  },
  messages: {
    user: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
    },
    assistant: {
      openai: {
        background: 'bg-green-50',
        text: 'text-gray-900',
        border: 'border-green-200',
        label: 'text-green-700',
      },
      anthropic: {
        background: 'bg-purple-50',
        text: 'text-gray-900',
        border: 'border-purple-200',
        label: 'text-purple-700',
      },
      gemini: {
        background: 'bg-blue-50',
        text: 'text-gray-900',
        border: 'border-blue-200',
        label: 'text-blue-700',
      },
    },
  },
  input: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-300',
    placeholder: 'placeholder:text-gray-400',
    focus: 'focus:border-gray-400 focus:ring-1 focus:ring-gray-400',
  },
  buttons: {
    primary: {
      background: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      hover: 'hover:bg-gray-200',
    },
    secondary: {
      background: 'bg-white',
      text: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-50',
    },
  },
}; 