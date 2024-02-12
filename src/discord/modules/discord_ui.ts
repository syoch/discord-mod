export type DiscordUIModule = {
  FormSection: React.FC<{
    tag: React.FC;
    title: string;
    children: React.ReactNode;
  }>;
  FormTitleTags: {
    H1: React.FC;
  };
  FormSwitch: React.FC<{
    value: boolean;
    onChange: (e: boolean) => void;
    note: string;
    children: React.ReactNode;
  }>;
  TextInput: React.FC<{
    className?: string;
    inputClassName?: string;
    inputPrefix?: string;
    disabled?: boolean;
    size?: number;
    editable?: boolean;
    prefixElement?: React.ReactElement;
    focusProps?: Record<string, string>;
    inputRef: React.RefObject<HTMLInputElement>;
  }>;
  Switch: React.FC<{
    onChange: (e: boolean) => void;
    checked: boolean;
    disabled?: boolean;
    className?: string;
  }>;
  FormItem: React.FC<{
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    titleClassName?: string;
    tag?: string;
    required?: boolean;
    style?: Record<string, string>;
    title: string;
    error?: boolean;
  }>;
  openModal: React.FC;
  ConfirmModal: React.FC<{
    header: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    children: React.ReactNode;
  }>;
  Text: React.FC<{
    variant: string;
    children: React.ReactNode;
  }>;
  Select: React.FC<{
    select: string;
    options: string[];
  }>;
};

const DicsordUI = {} as DiscordUIModule;

export default DicsordUI;

export function initDiscordUIModule(m: DiscordUIModule) {
  Object.assign(DicsordUI, m);
}
