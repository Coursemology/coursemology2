
# Do not modify beyond this line
if __name__ == '__main__':
    with open('report.xml', 'wb') as output:
        unittest.main(
            testRunner=xmlrunner.XMLTestRunner(output, outsuffix=''),
            failfast=False,
            buffer=False,
            catchbreak=False
        )
