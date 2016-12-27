
# Do not modify beyond this line
if __name__ == '__main__':
    unittest.main(
            testRunner=xmlrunner.XMLTestRunner(open('report.xml', 'wb'), outsuffix = ''),
            failfast=False,
            buffer=False,
            catchbreak=False)
