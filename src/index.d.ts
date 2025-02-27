import { Decorator } from 'final-form'

export type FieldName = string

export type FieldPattern = FieldName | RegExp | (FieldName | RegExp)[]

export type UpdatesByName = {
  [FieldName: string]: (value: any, allValues?: Object, prevValues?: Object) => any
}

export type UpdatesForAll = (
  value: any,
  field: string,
  allValues?: Object,
  prevValues?: Object,
) => { [FieldName: string]: any }

export type Updates = UpdatesByName | UpdatesForAll

export type Calculation = {
  field: FieldPattern,
  updates: Updates,
  isEqual?: (a: any, b: any) => boolean,
}

export default function createDecorator<FormValues = object>(
  { calculations, runOnInit, isPaused}: {calculations: Calculation[], runOnInit?: boolean, isPaused?: () => boolean}
): Decorator<FormValues>
