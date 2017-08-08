import org.testng.Assert;
import org.testng.annotations.Test;
import org.testng.annotations.BeforeSuite;
import org.testng.Reporter;
import org.testng.ITestResult;
import java.util.Arrays;

public class Autograder {
	// For standard byte, short, int, long comparisons - .equals() directly uses == to compare the values
	// For float, double comparisons - .equals() returns true if a == b,
	//									returns true for NaN values,
	//									returns false for +0.0 and -0.0
	void expectEquals(byte expression, byte expected) {
		Assert.assertEquals((Byte) expression, (Byte) expected);
	}

	void expectEquals(byte expression, short expected) {
		Assert.assertEquals((Short)(short) expression, (Short) expected);
	}

	void expectEquals(byte expression, int expected) {
		Assert.assertEquals((Integer)(int) expression, (Integer) expected);
	}

	void expectEquals(byte expression, long expected) {
		Assert.assertEquals((Long)(long) expression, (Long) expected);
	}
	
	void expectEquals(byte expression, double expected) {
		Assert.assertEquals((Double)(double) expression, (Double) expected);
	}

	void expectEquals(byte expression, float expected) {
		Assert.assertEquals((Float)(float) expression, (Float) expected);
	}

	void expectEquals(short expression, byte expected) {
		Assert.assertEquals((Short) expression, (Short)(short) expected);
	}

	void expectEquals(short expression, short expected) {
		System.out.println("short, short");
		Assert.assertEquals((Short) expression, (Short) expected);
	}

	void expectEquals(short expression, int expected) {
		Assert.assertEquals((Integer)(int) expression, (Integer) expected);
	}

	void expectEquals(short expression, long expected) {
		Assert.assertEquals((Long)(long) expression, (Long) expected);
	}
	
	void expectEquals(short expression, double expected) {
		Assert.assertEquals((Double)(double) expression, (Double) expected);
	}

	void expectEquals(short expression, float expected) {
		Assert.assertEquals((Float)(float) expression, (Float) expected);
	}

	void expectEquals(int expression, byte expected) {
		Assert.assertEquals((Integer) expression, (Integer)(int) expected);
	}

	void expectEquals(int expression, short expected) {
		Assert.assertEquals((Integer) expression, (Integer)(int) expected);
	}

	void expectEquals(int expression, int expected) {
		Assert.assertEquals((Integer) expression, (Integer) expected);
	}

	void expectEquals(int expression, long expected) {
		Assert.assertEquals((Long)(long) expression, (Long) expected);
	}
	
	void expectEquals(int expression, double expected) {
		Assert.assertEquals((Double)(double) expression, (Double) expected);
	}

	void expectEquals(int expression, float expected) {
		Assert.assertEquals((Float)(float) expression, (Float) expected);
	}

	void expectEquals(long expression, byte expected) {
		Assert.assertEquals((Long) expression, (Long)(long) expected);
	}

	void expectEquals(long expression, short expected) {
		Assert.assertEquals((Long) expression, (Long)(long) expected);
	}

	void expectEquals(long expression, int expected) {
		Assert.assertEquals((Long) expression, (Long)(long) expected);
	}

	void expectEquals(long expression, long expected) {
		Assert.assertEquals((Long) expression, (Long) expected);
	}
	
	void expectEquals(long expression, double expected) {
		Assert.assertEquals((Double)(double) expression, (Double) expected);
	}

	void expectEquals(long expression, float expected) {
		Assert.assertEquals((Double)(double) expression, (Double)(double) expected);
	}

	void expectEquals(double expression, byte expected) {
		Assert.assertEquals((Double) expression, (Double)(double) expected);
	}

	void expectEquals(double expression, short expected) {
		Assert.assertEquals((Double) expression, (Double)(double) expected);
	}

	void expectEquals(double expression, int expected) {
		Assert.assertEquals((Double) expression, (Double)(double) expected);
	}

	void expectEquals(double expression, long expected) {
		Assert.assertEquals((Double) expression, (Double)(double) expected);
	}
	
	void expectEquals(double expression, double expected) {
		Assert.assertEquals((Double) expression, (Double) expected);
	}

	void expectEquals(double expression, float expected) {
		Assert.assertEquals((Double) expression, (Double)(double) expected);
	}

	void expectEquals(float expression, byte expected) {
		Assert.assertEquals((Float) expression, (Float)(float) expected);
	}

	void expectEquals(float expression, short expected) {
		Assert.assertEquals((Float) expression, (Float)(float) expected);
	}

	void expectEquals(float expression, int expected) {
		Assert.assertEquals((Float) expression, (Float)(float) expected);
	}

	void expectEquals(float expression, long expected) {
		Assert.assertEquals((Double)(double) expression, (Double)(double) expected);
	}
	
	void expectEquals(float expression, double expected) {
		Assert.assertEquals((Double)(double) expression, (Double) expected);
	}

	void expectEquals(float expression, float expected) {
		Assert.assertEquals((Float) expression, (Float) expected);
	}

	void expectEquals(char expression, char expected) {
		Assert.assertEquals((Character) expression, (Character) expected);
	}

	void expectEquals(boolean expression, boolean expected) {
		Assert.assertEquals((Boolean) expression, (Boolean) expected);
	}

	void expectEquals(Object expression, Object expected) {
		Assert.assertEquals(expression, expected);
	}

	String printValue(Object val) {
		return String.valueOf(val);
	}

	String printValue(byte [] val) {
		return Arrays.toString(val);
	}

	String printValue(short [] val) {
		return Arrays.toString(val);
	}

	String printValue(int [] val) {
		return Arrays.toString(val);
	}

	String printValue(long [] val) {
		return Arrays.toString(val);
	}

	String printValue(double [] val) {
		return Arrays.toString(val);
	}

	String printValue(float [] val) {
		return Arrays.toString(val);
	}

	String printValue(char [] val) {
		return Arrays.toString(val);
	}

	String printValue(boolean [] val) {
		return Arrays.toString(val);
	}

	String printValue(Object [] val) {
		return Arrays.toString(val);
	}

	void setAttribute(String field, String message) {
		ITestResult res = Reporter.getCurrentTestResult();
		res.setAttribute(field, message);
	}