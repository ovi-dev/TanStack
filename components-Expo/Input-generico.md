# FormField — Componente Genérico (React Hook Form + Expo)

Componente wrapper sobre `Controller` de react-hook-form que expone una API de render prop tipada.

---

## Componente base

```tsx
import React from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  render: (props: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
  }) => React.ReactNode;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  rules,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) =>
        render({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
        }) as React.ReactElement
      }
    />
  );
}
```

---

## Ejemplos de uso

### 1. Input de texto básico

```tsx
type LoginForm = { email: string; password: string };

function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginForm>();

  return (
    <FormField
      control={control}
      name="email"
      rules={{
        required: "El email es obligatorio",
        pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
      }}
      render={({ value, onChange, onBlur, error }) => (
        <View>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Email"
          />
          {error && <Text style={{ color: "red" }}>{error}</Text>}
        </View>
      )}
    />
  );
}
```

---

### 2. Componente reutilizable encima del genérico

```tsx
type AppTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  secureTextEntry?: boolean;
};

function AppTextInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules,
  secureTextEntry,
}: AppTextInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ value, onChange, onBlur, error }) => (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ marginBottom: 4 }}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            style={[styles.input, error ? styles.inputError : null]}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}
    />
  );
}

// Uso:
<AppTextInput
  control={control}
  name="password"
  label="Contraseña"
  secureTextEntry
  rules={{ required: "Obligatorio" }}
/>;
```

---

### 3. Select / Picker

```tsx
<FormField
  control={control}
  name="ciudad"
  rules={{ required: "Selecciona una ciudad" }}
  render={({ value, onChange, error }) => (
    <View>
      <Picker selectedValue={value} onValueChange={onChange}>
        <Picker.Item label="Madrid" value="madrid" />
        <Picker.Item label="Buenos Aires" value="bsas" />
      </Picker>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  )}
/>
```

---

### 4. Switch / Toggle

```tsx
<FormField
  control={control}
  name="notificaciones"
  render={({ value, onChange }) => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text>Activar notificaciones</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  )}
/>
```

---

### 5. Checkbox

```tsx
<FormField
  control={control}
  name="terminos"
  rules={{ required: "Debes aceptar los términos" }}
  render={({ value, onChange, error }) => (
    <View>
      <Pressable
        onPress={() => onChange(!value)}
        style={{ flexDirection: "row", gap: 8 }}
      >
        <View style={[styles.checkbox, value && styles.checkboxChecked]} />
        <Text>Acepto los términos y condiciones</Text>
      </Pressable>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  )}
/>
```

---

### 6. DatePicker (`@react-native-community/datetimepicker`)

```tsx
<FormField
  control={control}
  name="fechaNacimiento"
  rules={{ required: "La fecha es obligatoria" }}
  render={({ value, onChange, error }) => (
    <View>
      <DateTimePicker
        value={value ?? new Date()}
        mode="date"
        onChange={(_, date) => onChange(date)}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  )}
/>
```

---

### 7. Textarea / Input multilínea

```tsx
<FormField
  control={control}
  name="descripcion"
  rules={{ maxLength: { value: 500, message: "Máximo 500 caracteres" } }}
  render={({ value, onChange, onBlur, error }) => (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        multiline
        numberOfLines={4}
        style={styles.textarea}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  )}
/>
```

---

### 8. Validación con transformación (número desde string)

```tsx
<FormField
  control={control}
  name="edad"
  rules={{
    required: "Obligatorio",
    min: { value: 18, message: "Debes ser mayor de edad" },
  }}
  render={({ value, onChange, onBlur, error }) => (
    <View>
      <TextInput
        value={String(value ?? "")}
        onChangeText={(text) => onChange(Number(text))}
        onBlur={onBlur}
        keyboardType="numeric"
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  )}
/>
```
