export const emailValidation = {
  required: "El email es requerido",
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Formato de email inválido",
  },
  minLength: {
    value: 5,
    message: "El email debe tener al menos 5 caracteres",
  },
};

export const passwordValidation = {
  required: "La contraseña es requerida",
  minLength: {
    value: 8,
    message: "La contraseña debe tener al menos 8 caracteres",
  },
  pattern: {
    value: /^(?=.*[A-Z])(?=.*\d)/,
    message: "Debe contener al menos una mayúscula y un número",
  },
};

export const phoneValidation = {
  required: "El teléfono es requerido",
  pattern: {
    value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    message: "Formato de teléfono inválido",
  },
  minLength: {
    value: 9,
    message: "El teléfono debe tener al menos 9 dígitos",
  },
};

export const textValidation = {
  required: "Este campo es requerido",
  minLength: {
    value: 3,
    message: "Debe tener al menos 3 caracteres",
  },
  maxLength: {
    value: 100,
    message: "No puede exceder 100 caracteres",
  },
};

export const fullNameValidation = {
  required: "El nombre completo es requerido",
  pattern: {
    value: /^[a-zA-ZÀ-ÿ\s]{3,}$/,
    message: "El nombre debe contener solo letras y espacios",
  },
  minLength: {
    value: 3,
    message: "El nombre debe tener al menos 3 caracteres",
  },
};

export const numberValidation = {
  required: "Este campo es requerido",
  pattern: {
    value: /^[0-9]+$/,
    message: "Solo se permiten números",
  },
};

export const urlValidation = {
  required: "La URL es requerida",
  pattern: {
    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: "Formato de URL inválido",
  },
};
export const requirementsValidation = {
  required:
    "Debes añadir información en los requisitos para que la IA tenga contexto suficiente.",
  minLength: {
    value: 10,
    message: "Los requisitos deben tener al menos 10 caracteres.",
  },
};
