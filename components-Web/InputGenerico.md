# FormField — Componente Genérico (React Hook Form + Next.js / Web)

Componente wrapper sobre `Controller` de react-hook-form. Actúa como adaptador entre el formulario y cualquier input de UI. No renderiza HTML propio — toda la presentación queda delegada a `render`.

---

## Componente base

```tsx
"use client";

import React from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

export type FormFieldRenderProps = {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  name: string;
};

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  render: (props: FormFieldRenderProps) => React.ReactNode;
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
          name: field.name,
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

function LoginPage() {
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
        <div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Email"
          />
          {error && <span style={{ color: "red" }}>{error}</span>}
        </div>
      )}
    />
  );
}
```

---

### 2. Componente reutilizable encima del genérico

```tsx
type AppInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  type?: string;
};

function AppInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules,
  type = "text",
}: AppInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ value, onChange, onBlur, error }) => (
        <div className="mb-3">
          <label>{label}</label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={error ? "input-error" : "input"}
          />
          {error && <span className="error-text">{error}</span>}
        </div>
      )}
    />
  );
}

// Uso:
<AppInput
  control={control}
  name="password"
  label="Contraseña"
  type="password"
  rules={{ required: "Obligatorio" }}
/>;
```

---

### 3. Select

```tsx
<FormField
  control={control}
  name="ciudad"
  rules={{ required: "Selecciona una ciudad" }}
  render={({ value, onChange, onBlur, error }) => (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        <option value="">-- Selecciona --</option>
        <option value="madrid">Madrid</option>
        <option value="barcelona">Barcelona</option>
      </select>
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```

---

### 4. Checkbox

```tsx
<FormField
  control={control}
  name="terminos"
  rules={{ required: "Debes aceptar los términos" }}
  render={({ value, onChange, error }) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        Acepto los términos y condiciones
      </label>
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```

---

### 5. Textarea / Input multilínea

```tsx
<FormField
  control={control}
  name="descripcion"
  rules={{ maxLength: { value: 500, message: "Máximo 500 caracteres" } }}
  render={({ value, onChange, onBlur, error }) => (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={4}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```

---

### 6. Radio group

```tsx
<FormField
  control={control}
  name="plan"
  rules={{ required: "Selecciona un plan" }}
  render={({ value, onChange, error }) => (
    <div>
      {["básico", "pro", "enterprise"].map((opt) => (
        <label key={opt}>
          <input
            type="radio"
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```

---

### 7. Validación con transformación (número desde string)

```tsx
<FormField
  control={control}
  name="edad"
  rules={{
    required: "Obligatorio",
    min: { value: 18, message: "Debes ser mayor de edad" },
  }}
  render={({ value, onChange, onBlur, error }) => (
    <div>
      <input
        type="number"
        value={String(value ?? "")}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```

---

### 8. Integración con componente de UI externo (ej. shadcn/ui)

```tsx
<FormField
  control={control}
  name="rol"
  rules={{ required: "Selecciona un rol" }}
  render={({ value, onChange, error, name }) => (
    <div>
      <Select value={value} onValueChange={onChange} name={name}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  )}
/>
```
