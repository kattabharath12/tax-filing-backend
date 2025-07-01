export const mockExtractData = (fileType) => {
  if (fileType === 'W-2') {
    return {
      employerName: 'Demo Employer Inc.',
      wages: 55000,
      federalTaxWithheld: 5000,
      ssn: '123-45-6789',
    };
  } else if (fileType === '1099-NEC') {
    return {
      payerName: 'Demo Payer LLC',
      nonEmployeeComp: 12000,
      federalTaxWithheld: 1200,
      ssn: '123-45-6789',
    };
  } else {
    return {};
  }
};