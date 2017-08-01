import org.testng.TestNG;
import org.testng.reporters.XMLReporter;
import org.testng.xml.XmlSuite;
import org.testng.xml.XmlClass;
import org.testng.xml.XmlTest;
import java.util.ArrayList;
import java.util.List;

public class RunTests {
	public static void main(String[] args){
		XMLReporter reporter = new XMLReporter();
		reporter.getConfig().setGenerateTestResultAttributes(true);
		reporter.getConfig().setOutputDirectory(".");

		XmlSuite suite = new XmlSuite();
		suite.setName("AllTests");

		List<XmlClass> classes = new ArrayList<XmlClass>();
		classes.add(new XmlClass("Autograder"));

		XmlTest test = new XmlTest(suite);
		test.setName("tests");
		test.setXmlClasses(classes);

		List<XmlSuite> suites = new ArrayList<XmlSuite>();
		suites.add(suite);

		TestNG testNG = new TestNG();
		testNG.setXmlSuites(suites);
		testNG.addListener(reporter);
		testNG.run();
	}
}
