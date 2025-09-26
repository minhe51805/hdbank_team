export interface OfferMessage {
  title: string;
  lines: string[];
  timeoutMs?: number;
}

export interface OfferResponse {
  shouldNotify: boolean;
  probability: number | null;
  decision: string | null;
  facts: string | null;
  year_month: string;
  message: OfferMessage | null;
}

const API = 'http://127.0.0.1:4000';

export async function fetchOffer(customerId: number, threshold = 0.6): Promise<OfferResponse> {
  const url = `${API}/signals/offer?customerId=${encodeURIComponent(customerId)}&threshold=${encodeURIComponent(threshold)}&year_month=2025-08`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không lấy được tín hiệu ưu đãi');
  return res.json();
}


