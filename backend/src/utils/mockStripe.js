// Имитация платёжного провайдера (Stripe)
export async function charge({ amount, currency = 'RUB', source }) {
  // Небольшая задержка для реализма
  await new Promise((res) => setTimeout(res, 200));
  if (!amount || Number(amount) <= 0) {
    return { success: false, error: 'Invalid amount' };
  }
  // Возвращаем фиктивный ID транзакции
  const paymentId = 'pi_' + Math.random().toString(36).slice(2, 12);
  return { success: true, paymentId, currency, amount: Number(amount).toFixed(2) };
}
