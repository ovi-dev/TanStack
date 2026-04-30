import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import {
BaseButton,
BaseButtonProps,
} from "@/components/ui/Button/base-button";
import { BaseColors } from "@/theme/constants/baseColors";
import { useThemeColors } from "@/theme/hooks/useThemeColors";
import { useWithAppTheme } from "@/theme/hooks/useWithAppTheme";
import { ThemeColors } from "@/theme/types/themeColors";

// ---------------------------------------------------------------------------
// Variantes disponibles
// ---------------------------------------------------------------------------
export type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type AppButtonIconPosition = "left" | "right";

export type AppButtonProps = Omit<BaseButtonProps, "children"> & {
label: string;
variant?: AppButtonVariant;
icon?: React.ReactNode;
iconPosition?: AppButtonIconPosition;
};

export function AppButton({
label,
variant = "primary",
style,
disabled,
icon,
iconPosition = "left",
...rest
}: AppButtonProps) {
const styles = useWithAppTheme(createStyles);
const themeColors = useThemeColors();

const labelNode = (
<Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
);

const iconNode = icon ? (
<View style={iconPosition === "left" ? styles.iconLeft : styles.iconRight}>
{icon}
</View>
) : null;

const innerContent = (
<View style={styles.content}>
{iconPosition === "left" && iconNode}
{labelNode}
{iconPosition === "right" && iconNode}
</View>
);

// Gradientes por variante
const variantGradients: Record<AppButtonVariant, [string, string]> = {
primary: [BaseColors.skyBlueLight, themeColors.button.buttonBackground],
secondary: [BaseColors.red, BaseColors.slate100],
ghost: [BaseColors.transparent, BaseColors.transparent],
danger: [BaseColors.sunsetOrange, BaseColors.red],
};

return (
<BaseButton
style={[styles.base, styles[variant], disabled && styles.disabled, style]}
disabled={disabled}
{...rest} >
{variant === "primary" ? (
<LinearGradient
colors={variantGradients.primary}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
style={styles.primary} >
{innerContent}
</LinearGradient>
) : (
<>
<LinearGradient
colors={variantGradients[variant]}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
style={StyleSheet.absoluteFillObject}
/>
{innerContent}
</>
)}
</BaseButton>
);
}

// ---------------------------------------------------------------------------
// Estilos por tema
// ---------------------------------------------------------------------------
const createStyles = (color: ThemeColors) =>
StyleSheet.create({
// --- Base ---
base: {
borderRadius: 14,
alignItems: "center",
justifyContent: "center",
},
label: {
fontWeight: "bold",
},

    // --- Variantes: contenedor ---
    primary: {
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 50,
      height: 48,
      width: "85%",
    },
    secondary: {
      borderWidth: 1.5,
      borderColor: color.button.buttonBackground,
      height: 48,
      width: "85%",
      alignSelf: "center",
    },
    ghost: {
      backgroundColor: "transparent",
      height: 48,
      // width: "80%",
      alignSelf: "center",
    },
    danger: {
      shadowColor: color.general.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      height: 48,
      width: "85%",
      alignSelf: "center",
    },
    disabled: {
      shadowOpacity: 0,
    },

    // --- Variantes: texto ---
    primaryLabel: {
      color: color.general.background,
      fontSize: 17,
    },
    secondaryLabel: {
      color: color.button.buttonBackground,
      fontSize: 17,
    },
    ghostLabel: {
      color: color.button.buttonBackground,
      fontSize: 17,
    },
    dangerLabel: {
      color: color.general.background,
      fontSize: 17,
    },

    // --- Contenido interno (fila centrada) ---
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    // --- Gradiente (primary) ---
    gradient: {
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
    // --- Icono ---
    iconLeft: {
      marginRight: 8,
    },
    iconRight: {
      marginLeft: 8,
    },

});

// ---------------------------------------------------------------------------
// CÓMO USAR AppButton
// ---------------------------------------------------------------------------
//
// IMPORTACIÓN
// ---------------------------------------------------------------------------
// import { AppButton } from "@/components/ui/app-button";
//
// ---------------------------------------------------------------------------
// 1. USO BÁSICO — variante y tamaño por defecto (primary / md)
// ---------------------------------------------------------------------------
// <AppButton label="Guardar" onPress={handleSave} />
//
// ---------------------------------------------------------------------------
// 2. VARIANTES
// ---------------------------------------------------------------------------
// primary → fondo sólido del color del tema (acción principal)
// secondary → borde del color del tema, fondo transparente
// ghost → sin fondo ni borde (acción sutil)
// danger → fondo rojo (acciones destructivas)
//
// <AppButton label="Confirmar"  variant="primary"   onPress={handleConfirm} />
// <AppButton label="Cancelar"   variant="secondary" onPress={handleCancel} />
// <AppButton label="Omitir"     variant="ghost"     onPress={handleSkip} />
// <AppButton label="Eliminar"   variant="danger"    onPress={handleDelete} />
//
// ---------------------------------------------------------------------------
// 3. COMBINANDO VARIANTE + ESTILO
// ---------------------------------------------------------------------------
// <AppButton label="Eliminar cuenta" variant="danger"     onPress={handleDelete} />
// <AppButton label="Ver más"         variant="ghost"      onPress={handleMore} />
// <AppButton label="Aceptar"         variant="secondary"  onPress={handleAccept} />
//
// ---------------------------------------------------------------------------
// 4. DESHABILITADO
// ---------------------------------------------------------------------------
// <AppButton label="Guardando..." disabled={isLoading} onPress={handleSave} />
//
// Cuando disabled=true:
// - El botón no responde a toques
// - La opacidad baja automáticamente a 0.4 (heredado de BaseButton)
// - Se eliminan sombras para reforzar el estado inactivo
//
// ---------------------------------------------------------------------------
// 5. SOBREESCRIBIR ESTILOS DEL CONTENEDOR
// ---------------------------------------------------------------------------
// El prop style se aplica encima de los estilos de variante/tamaño.
// Útil para ajustar width, margin, borderRadius, etc.
//
// <AppButton
// label="Siguiente"
// onPress={handleNext}
// style={{ width: "100%", marginTop: 16 }}
// />
//
// <AppButton
// label="Acción"
// variant="primary"
// style={{ borderRadius: 999 }} // pill shape
// onPress={handlePress}
// />
//
// ---------------------------------------------------------------------------
// 6. ANCHO COMPLETO
// ---------------------------------------------------------------------------
// <AppButton
// label="Comenzar"
// onPress={handleStart}
// style={{ alignSelf: "stretch" }}
// />
//
// ---------------------------------------------------------------------------
// 7. CON OPACIDADES PERSONALIZADAS AL PRESIONAR / DESHABILITAR
// ---------------------------------------------------------------------------
// Heredados directamente de BaseButton:
//
// <AppButton
// label="Enviar"
// onPress={handleSend}
// pressedOpacity={0.6} // opacidad al presionar (defecto: 0.8)
// disabledOpacity={0.3} // opacidad si disabled (defecto: 0.4)
// />
//
// ---------------------------------------------------------------------------
// 8. CON ICONO A LA IZQUIERDA
// ---------------------------------------------------------------------------
// import { IconSymbol } from "@/components/ui/icon-symbol";
//
// <AppButton
// label="Guardar"
// icon={<IconSymbol name="checkmark" size={18} color="#fff" />}
// iconPosition="left" // ← defecto, se puede omitir
// onPress={handleSave}
// />
//
// ---------------------------------------------------------------------------
// 9. CON ICONO A LA DERECHA
// ---------------------------------------------------------------------------
// <AppButton
// label="Siguiente"
// icon={<IconSymbol name="chevron.right" size={18} color="#fff" />}
// iconPosition="right"
// onPress={handleNext}
// />
//
// ---------------------------------------------------------------------------
// PROPS DISPONIBLES
// ---------------------------------------------------------------------------
// label string Texto que muestra el botón (requerido)
// variant? AppButtonVariant "primary" | "secondary" | "ghost" | "danger"
// icon? ReactNode Nodo del icono (cualquier componente)
// iconPosition? AppButtonIconPosition "left" | "right" (defecto: "left")
// onPress? (event) => void Callback al presionar
// onLongPress? (event) => void Callback al presionar largo
// disabled? boolean Bloquea interacción (defecto: false)
// pressedOpacity? number Opacidad al presionar (defecto: 0.8)
// disabledOpacity? number Opacidad si disabled (defecto: 0.4)
// style? StyleProp<ViewStyle> Estilos extra del contenedor
// ...rest BaseButtonProps Todos los props de BaseButton / Pressable
// ---------------------------------------------------------------------------
