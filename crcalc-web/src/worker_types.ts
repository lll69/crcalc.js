export type InitResult = {
    type: "init"
}

export type CreateURRequest = {
    type: "createUR",
    id: number,
    uid: number,
    expr: string,
    degreeMode: boolean
}

export type CreateURResultSuccess = {
    type: "createUR",
    id: number,
    uid: number,
    expr: string,
    degreeMode: boolean,
    digitsRequired: number,
    success: true,
    error: undefined
}

export type CreateURResultError = {
    type: "createUR",
    id: number,
    uid: number,
    expr: string,
    degreeMode: boolean,
    digitsRequired: number,
    success: undefined,
    error: string
}

export type CreateURResult = CreateURResultSuccess | CreateURResultError;

export type ToStringRequest = {
    type: "toStringTruncated",
    id: number,
    uid: number,
    prec: number
}

export type ToStringResultSuccess = {
    type: "toStringTruncated",
    id: number,
    uid: number,
    prec: number,
    result: string,
    error: undefined
}

export type ToStringResultError = {
    type: "toStringTruncated",
    id: number,
    uid: number,
    prec: number,
    result: undefined,
    error: string
}

export type ToStringResult = ToStringResultSuccess | ToStringResultError;

export type CopyURRequest = {
    type: "copyUR",
    id: number,
    fromId: number
}

export type RemoveURRequest = {
    type: "removeUR",
    id: number
}

export type WorkerRequest = CreateURRequest | CopyURRequest | RemoveURRequest | ToStringRequest;
export type WorkerResult = InitResult | CreateURResult | ToStringResult;
