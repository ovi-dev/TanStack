import React from "react";
import {
GestureResponderEvent,
Pressable,
PressableProps,
StyleProp,
ViewStyle,
} from "react-native";

export type BaseButtonProps = Omit<PressableProps, "style"> & {
onPress?: (event: GestureResponderEvent) => void;
onLongPress?: (event: GestureResponderEvent) => void;
disabled?: boolean;
/\*\*

- Opacity applied when the button is pressed. Defaults to 0.8.
  \*/
  pressedOpacity?: number;
  /\*\*
- Opacity applied when the button is disabled. Defaults to 0.4.
  \*/
  disabledOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  };

/\*\*

- Generic base button with no visual styles.
- Handles press/disabled state and exposes all Pressable props.
- Use this as the foundation for styled button components.
  \*/
  export function BaseButton({
  onPress,
  onLongPress,
  disabled = false,
  pressedOpacity = 0.8,
  disabledOpacity = 0.4,
  style,
  children,
  ...rest
  }: BaseButtonProps) {
  return (
  <Pressable
  {...rest}
  onPress={disabled ? undefined : onPress}
  onLongPress={disabled ? undefined : onLongPress}
  accessibilityRole="button"
  accessibilityState={{ disabled }}
  style={({ pressed }) => [
  { opacity: disabled ? disabledOpacity : pressed ? pressedOpacity : 1 },
  typeof style === "function" ? (style as any)({ pressed }) : style,
  ]} >
  {children}
  </Pressable>
  );
  }

// ---------------------------------------------------------------------------
// CÓMO USAR BaseButton
// ---------------------------------------------------------------------------
//
// 1. USO BÁSICO — solo texto dentro del botón
// ---------------------------------------------------------------------------
// import { BaseButton } from "@/components/ui/base-button";
// import { Text } from "react-native";
//
// <BaseButton onPress={() => console.log("presionado")}>
// <Text>Aceptar</Text>
// </BaseButton>
//
// ---------------------------------------------------------------------------
// 2. CON ESTILOS — pasando un objeto de estilos
// ---------------------------------------------------------------------------
// <BaseButton
// onPress={handleSubmit}
// style={{
//     backgroundColor: "#4F46E5",
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     borderRadius: 12,
//     alignItems: "center",
//   }}
// >
// <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar</Text>
// </BaseButton>
//
// ---------------------------------------------------------------------------
// 3. CON ESTILOS DINÁMICOS según el estado pressed
// ---------------------------------------------------------------------------
// <BaseButton
// onPress={handleNext}
// style={({ pressed }) => ({
// backgroundColor: pressed ? "#3730A3" : "#4F46E5",
// paddingVertical: 14,
// borderRadius: 12,
// })}
// >
// <Text style={{ color: "#fff" }}>Siguiente</Text>
// </BaseButton>
//
// ---------------------------------------------------------------------------
// 4. DESHABILITADO
// ---------------------------------------------------------------------------
// <BaseButton onPress={handleSave} disabled={isLoading}>
// <Text>Guardar</Text>
// </BaseButton>
//
// Cuando disabled=true:
// - onPress y onLongPress no se ejecutan
// - La opacidad baja a disabledOpacity (defecto 0.4)
//
// ---------------------------------------------------------------------------
// 5. PERSONALIZAR OPACIDADES
// ---------------------------------------------------------------------------
// <BaseButton
// onPress={handlePress}
// pressedOpacity={0.6} // opacidad al presionar (defecto: 0.8)
// disabledOpacity={0.3} // opacidad al deshabilitar (defecto: 0.4)
// >
// <Text>Botón</Text>
// </BaseButton>
//
// ---------------------------------------------------------------------------
// 6. COMO BASE DE UN COMPONENTE ESTILIZADO (patrón recomendado)
// ---------------------------------------------------------------------------
// import { BaseButton, BaseButtonProps } from "@/components/ui/base-button";
// import { StyleSheet, Text } from "react-native";
//
// type PrimaryButtonProps = BaseButtonProps & {
// label: string;
// };
//
// export function PrimaryButton({ label, style, ...rest }: PrimaryButtonProps) {
// return (
// <BaseButton style={[styles.button, style]} {...rest}>
// <Text style={styles.label}>{label}</Text>
// </BaseButton>
// );
// }
//
// const styles = StyleSheet.create({
// button: {
// backgroundColor: "#4F46E5",
// paddingVertical: 16,
// borderRadius: 14,
// alignItems: "center",
// },
// label: {
// color: "#fff",
// fontWeight: "bold",
// fontSize: 16,
// },
// });
//
// ---------------------------------------------------------------------------
// PROPS DISPONIBLES
// ---------------------------------------------------------------------------
// onPress? (event) => void Callback al presionar
// onLongPress? (event) => void Callback al presionar largo
// disabled? boolean Bloquea interacción (defecto: false)
// pressedOpacity? number Opacidad al presionar (defecto: 0.8)
// disabledOpacity? number Opacidad si disabled (defecto: 0.4)
// style? StyleProp<ViewStyle> Estilos del contenedor (objeto o función)
// children? ReactNode Contenido del botón
// ...rest PressableProps Todos los props nativos de Pressable
// ---------------------------------------------------------------------------
