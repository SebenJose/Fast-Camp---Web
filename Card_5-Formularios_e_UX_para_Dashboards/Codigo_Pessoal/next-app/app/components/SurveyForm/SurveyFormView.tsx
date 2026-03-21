"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react"
import { Controller, UseFormReturn } from "react-hook-form"

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { SurveyInput } from "@/app/types/survey"

interface SurveyFormViewProps {
  form: UseFormReturn<SurveyInput>
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  isSuccess: boolean
  hideHeader?: boolean
}

export function SurveyFormView({
  form,
  onSubmit,
  isSubmitting,
  isSuccess,
  hideHeader = false,
}: SurveyFormViewProps) {
  const {
    control,
    formState: { errors },
  } = form

  return (
    <Card className="border-none shadow-xl">
      {!hideHeader && (
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Nova Pesquisa de Leitura
          </CardTitle>
          <CardDescription>
            Preencha os dados abaixo para contribuir com nossa base de
            conhecimentos e atualizar nossos dashboards.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <form id="survey-form" onSubmit={onSubmit} className="mt-4 space-y-8">
          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-semibold">Data da Leitura</Label>
            <Controller
              control={control}
              name="readingDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant={"outline"}
                        className={`h-11 w-full justify-start rounded-xl text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.readingDate && (
              <p className="text-xs font-medium text-destructive">
                {errors.readingDate.message}
              </p>
            )}
          </div>

          {/* Tema Favorito */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tema Favorito</Label>
            <Controller
              control={control}
              name="theme"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Economia">Economia</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.theme && (
              <p className="text-xs font-medium text-destructive">
                {errors.theme.message}
              </p>
            )}
          </div>

          {/* Frequência de Leitura */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">
              Com que frequência você lê sobre este tema?
            </Label>
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                  {["Diariamente", "Semanalmente", "Raramente"].map(
                    (option) => (
                      <div key={option} className="relative">
                        <RadioGroupItem
                          value={option}
                          id={option}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option}
                          className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-muted bg-card p-4 text-center transition-all peer-data-checked:border-primary peer-data-checked:bg-primary/5 hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="text-sm font-semibold">
                            {option}
                          </span>
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              )}
            />
            {errors.frequency && (
              <p className="text-xs font-medium text-destructive">
                {errors.frequency.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t bg-muted/20 pt-6">
        <Button
          form="survey-form"
          type="submit"
          className="h-12 w-full rounded-xl text-base font-bold transition-all hover:shadow-lg active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Salvo com sucesso!
            </>
          ) : (
            "Salvar Resposta"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
