export const calculateTax = (formData) => {
  const income = Number(formData.income) || 0;
  const itemizedDeductions = Number(formData.itemizedDeductions) || 0;
  const standardDeduction = 12550;
  const withholding = Number(formData.withholding) || 0;
  const selfEmploymentIncome = Number(formData.selfEmploymentIncome) || 0;

  const deduction = itemizedDeductions > standardDeduction ? itemizedDeductions : standardDeduction;

  const taxableIncome = Math.max(0, income + selfEmploymentIncome - deduction);

  let taxOwed = 0;
  if (taxableIncome <= 9950) {
    taxOwed = taxableIncome * 0.10;
  } else if (taxableIncome <= 40525) {
    taxOwed = 995 + (taxableIncome - 9950) * 0.12;
  } else if (taxableIncome <= 86375) {
    taxOwed = 4664 + (taxableIncome - 40525) * 0.22;
  } else {
    taxOwed = 14751 + (taxableIncome - 86375) * 0.24;
  }

  const refundOrOwed = withholding - taxOwed;

  return {
    taxableIncome,
    taxOwed,
    refundOrOwed,
  };
};