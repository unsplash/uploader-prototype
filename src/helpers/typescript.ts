type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type ObjectOmit<T extends K, K> = Omit<T, keyof K>;

export type ObjectDiff<O1 extends O2, O2> = ObjectOmit<O1, O2> & Partial<O2>;

export const createPickedObject = <T>() => <K extends keyof T>(picked: Pick<T, K>) => picked;

export const createSubType = <T>() => <SubType extends T>(subType: SubType) => subType;
