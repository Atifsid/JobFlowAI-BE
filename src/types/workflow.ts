export interface Workflow<TInput, TOutput> {
  run(input: TInput): Promise<TOutput>;
}