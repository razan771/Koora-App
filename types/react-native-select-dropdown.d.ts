declare module 'react-native-select-dropdown' {
  import { Component } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  interface SelectDropdownProps<T = any> {
    data: T[];
    onSelect: (selectedItem: T, index: number) => void;
    defaultValueByIndex?: number;
    defaultButtonText?: string;
    buttonTextAfterSelection?: (selectedItem: T, index: number) => string;
    rowTextForSelection?: (item: T, index: number) => string;
    buttonStyle?: StyleProp<ViewStyle>;
    buttonTextStyle?: StyleProp<TextStyle>;
    renderDropdownIcon?: () => JSX.Element;
    dropdownStyle?: StyleProp<ViewStyle>;
    rowStyle?: StyleProp<ViewStyle>;
    rowTextStyle?: StyleProp<TextStyle>;
  }

  export default class SelectDropdown extends Component<SelectDropdownProps> {}
}
