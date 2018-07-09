public class AutograderResult<T> {
  private T result;

  public AutograderResult(T theResult) {
    result = theResult;
  }

  public T getResult() {
    return result;
  }
}
