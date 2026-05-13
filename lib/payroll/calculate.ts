/**
 * Pure payroll calculation — no DB calls, fully testable.
 * All monetary values in AFN, rounded to 2 decimal places.
 */

import type { PayType, AttendanceStatus, PieceRateLine } from '@/types/database'

export interface AttendanceSummary {
  daysPresent: number
  daysAbsent: number
  daysHoliday: number
  daysSick: number
  totalOvertimeHours: number
  workingDaysInPeriod: number  // total calendar working days (excl Fridays + holidays)
}

export interface ProductionLine {
  workCode: string
  description: string
  quantity: number
  unitPrice: number
}

export interface EmployeePayInput {
  id: string
  payType: PayType
  baseSalary: number          // monthly fixed component
  dailyRate: number           // used for daily/mixed
  transportRate: number       // per working day
  foodDeductionDaily: number  // per present day
  advanceBalance: number      // outstanding advance to recover this month
  attendance: AttendanceSummary
  productionLines: ProductionLine[]
}

export interface PayslipCalc {
  employeeId: string
  daysPresent: number
  daysAbsent: number
  daysHoliday: number
  daysSick: number
  fixedEarnings: number
  pieceRateEarnings: number
  pieceRateLines: PieceRateLine[]
  overtime: number
  transport: number
  foodDeduction: number
  tax: number
  advanceRecovery: number
  advanceOpeningBalance: number
  advanceClosingBalance: number
  grossPay: number
  totalDeductions: number
  netPay: number
}

const OVERTIME_RATE = 1.5   // 1.5× daily rate per overtime hour ÷ 8
const TAX_THRESHOLD = 5000  // AFN monthly — exempt below this
const TAX_RATE = 0.02       // 2% flat above threshold (simplified Afghan payroll tax)

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function calculatePayslip(emp: EmployeePayInput): PayslipCalc {
  const {
    payType, baseSalary, dailyRate, transportRate, foodDeductionDaily,
    advanceBalance, attendance, productionLines,
  } = emp

  const { daysPresent, daysAbsent, daysHoliday, daysSick, totalOvertimeHours, workingDaysInPeriod } = attendance

  // ── FIXED EARNINGS ─────────────────────────────────────────────────────────
  let fixedEarnings = 0
  if (payType === 'fixed' || payType === 'mixed') {
    // Pro-rate: baseSalary × (daysPresent + daysHoliday + daysSick) / workingDays
    const paidDays = daysPresent + daysHoliday + daysSick
    fixedEarnings = workingDaysInPeriod > 0
      ? round2(baseSalary * (paidDays / workingDaysInPeriod))
      : 0
  }
  if (payType === 'daily') {
    fixedEarnings = round2(dailyRate * daysPresent)
  }

  // ── PIECE-RATE EARNINGS ────────────────────────────────────────────────────
  let pieceRateEarnings = 0
  const pieceRateLines: PieceRateLine[] = []
  if (payType === 'piece_rate' || payType === 'mixed') {
    for (const line of productionLines) {
      const total = round2(line.quantity * line.unitPrice)
      pieceRateEarnings = round2(pieceRateEarnings + total)
      pieceRateLines.push({
        work_code: line.workCode,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        total,
      })
    }
  }

  // ── OVERTIME ───────────────────────────────────────────────────────────────
  const hourlyRate = dailyRate > 0 ? dailyRate / 8 : baseSalary / (workingDaysInPeriod || 1) / 8
  const overtime = round2(totalOvertimeHours * hourlyRate * OVERTIME_RATE)

  // ── TRANSPORT ──────────────────────────────────────────────────────────────
  // Paid for each present day
  const transport = round2(transportRate * daysPresent)

  // ── DEDUCTIONS ─────────────────────────────────────────────────────────────
  const foodDeduction = round2(foodDeductionDaily * daysPresent)

  const grossPay = round2(fixedEarnings + pieceRateEarnings + overtime + transport)

  // Simple Afghan tax: 2% of gross above 5,000 AFN
  const tax = grossPay > TAX_THRESHOLD ? round2((grossPay - TAX_THRESHOLD) * TAX_RATE) : 0

  // Advance recovery: recover full outstanding balance this month (capped at net-of-tax)
  const netBeforeAdvance = round2(grossPay - foodDeduction - tax)
  const advanceRecovery = round2(Math.min(advanceBalance, Math.max(0, netBeforeAdvance)))

  const totalDeductions = round2(foodDeduction + tax + advanceRecovery)
  const netPay = round2(grossPay - totalDeductions)

  const advanceClosingBalance = round2(Math.max(0, advanceBalance - advanceRecovery))

  return {
    employeeId: emp.id,
    daysPresent,
    daysAbsent,
    daysHoliday,
    daysSick,
    fixedEarnings,
    pieceRateEarnings,
    pieceRateLines,
    overtime,
    transport,
    foodDeduction,
    tax,
    advanceRecovery,
    advanceOpeningBalance: round2(advanceBalance),
    advanceClosingBalance,
    grossPay,
    totalDeductions,
    netPay,
  }
}

export function sumPayslips(slips: PayslipCalc[]) {
  return {
    totalGross: round2(slips.reduce((s, p) => s + p.grossPay, 0)),
    totalDeductions: round2(slips.reduce((s, p) => s + p.totalDeductions, 0)),
    totalNet: round2(slips.reduce((s, p) => s + p.netPay, 0)),
  }
}
