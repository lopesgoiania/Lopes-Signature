import { useEffect, useId, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import PhoneInput from "react-phone-number-input/max";
import flags from "react-phone-number-input/flags";
import labels from "react-phone-number-input/locale/pt.json";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  type CountryCode,
} from "libphonenumber-js/max";
import "react-phone-number-input/style.css";
import "./phone-field.css";

let countryRequest: Promise<CountryCode> | undefined;
function visitorCountry() {
  return (countryRequest ??= fetch("/api/visitor-country", {
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Country unavailable");
      const { country } = await response.json();
      return getCountries().includes(country) ? (country as CountryCode) : "BR";
    })
    .catch(() => "BR" as CountryCode));
}

/** Visible regional formatting; only a validated E.164 value is submitted. */
export function PhoneField({
  id,
  required = true,
  className = "",
}: {
  id?: string;
  required?: boolean;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id || `phone-${generatedId}`;
  const wrapper = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const [country, setCountry] = useState<CountryCode>("BR");
  const [value, setValue] = useState<string>();
  const [touched, setTouched] = useState(false);
  const valid = !!value && isValidPhoneNumber(value);
  const error =
    value && !valid
      ? "Informe um telefone válido para o país selecionado."
      : required && !value
        ? "Informe seu telefone com DDD."
        : "";

  useEffect(() => {
    let active = true;
    visitorCountry().then((detected) => {
      if (active && !interacted.current) setCountry(detected);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    wrapper.current
      ?.querySelector<HTMLInputElement>("input[type=tel]")
      ?.setCustomValidity(error);
  }, [error]);
  useEffect(() => {
    const form = wrapper.current?.closest("form");
    const reset = () => {
      setValue(undefined);
      setTouched(false);
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, []);

  return (
    <div
      ref={wrapper}
      className={`signature-phone ${className}`}
      onPointerDownCapture={() => {
        interacted.current = true;
      }}
      onKeyDownCapture={() => {
        interacted.current = true;
      }}
    >
      <PhoneInput
        id={inputId}
        aria-label="Telefone ou WhatsApp"
        name="phone_display"
        defaultCountry={country}
        international
        countryCallingCodeEditable={false}
        addInternationalOption={false}
        flags={flags}
        labels={labels}
        countrySelectComponent={CountrySelect}
        countrySelectProps={{ "aria-label": "País do telefone" }}
        value={value}
        onChange={(next) => {
          interacted.current = true;
          setValue(next);
        }}
        required={required}
        autoComplete="tel"
        inputMode="tel"
        onBlur={() => setTouched(true)}
        onInvalid={() => setTouched(true)}
        aria-invalid={touched && !!error}
        aria-describedby={touched && error ? `${inputId}-error` : undefined}
      />
      <input type="hidden" name="phone" value={valid ? value : ""} />
      {touched && error && (
        <small
          id={`${inputId}-error`}
          className="signature-phone-error"
          role="alert"
        >
          {error}
        </small>
      )}
    </div>
  );
}

type CountryOption = { value?: CountryCode; label: string; divider?: boolean };
function CountrySelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value?: CountryCode;
  onChange: (country: CountryCode) => void;
  options: CountryOption[];
  disabled?: boolean;
}) {
  const Flag = value ? flags[value] : undefined;
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => onChange(next as CountryCode)}
      disabled={disabled}
    >
      <Select.Trigger
        className="signature-country-trigger"
        aria-label="País do telefone"
      >
        {Flag && <Flag title={labels[value!]} />}
        <ChevronDown size={14} aria-hidden="true" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="signature-country-list"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="signature-country-scroll">
            <ChevronUp size={16} aria-hidden="true" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options
              .filter((option) => option.value && !option.divider)
              .map((option) => {
                const CountryFlag = flags[option.value!];
                return (
                  <Select.Item
                    className="signature-country-option"
                    key={option.value}
                    value={option.value!}
                    textValue={option.label}
                  >
                    {CountryFlag && <CountryFlag title={option.label} />}
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <span>+{getCountryCallingCode(option.value!)}</span>
                  </Select.Item>
                );
              })}
          </Select.Viewport>
          <Select.ScrollDownButton className="signature-country-scroll">
            <ChevronDown size={16} aria-hidden="true" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
