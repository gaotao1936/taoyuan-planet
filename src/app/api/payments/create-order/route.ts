import { NextResponse } from "next/server";
import { getProductById, createOrder, getOrderByOrderNo } from "@/lib/store";
import { getPaymentAdapter } from "@/lib/payments/registry";
import { COMMISSION_RATE, getCreatorAmount } from "@/lib/config";
import { Order } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity = 1, buyerName, buyerPhone, shippingAddress, paymentMethod = "alipay", channel } = body;

    if (!productId || !buyerPhone) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const product = getProductById(parseInt(productId));
    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    const totalAmount = product.price * quantity;

    // Generate readable order number
    const orderNo = `TY${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order: Order = {
      id: orderNo,
      orderNo,
      createTime: new Date().toISOString(),
      status: "待付款",
      items: [
        {
          productId: product.id,
          productName: product.title,
          price: product.price,
          quantity,
          image: product.images[0] || "",
        },
      ],
      totalAmount,
      buyerName: buyerName || "",
      buyerPhone,
      shippingAddress: shippingAddress || "",
      paymentMethod,
      commissionRate: COMMISSION_RATE,
      creatorAmount: getCreatorAmount(totalAmount),
    };

    // Save to store
    createOrder(order);

    // Initiate payment
    try {
      const adapter = getPaymentAdapter(paymentMethod);
      const paymentIntent = await adapter.createPayment(
        orderNo,
        totalAmount,
        `${product.title} x${quantity}`,
        { channel }
      );

      return NextResponse.json({
        success: true,
        orderNo,
        payUrl: paymentIntent.payUrl,
        amount: totalAmount,
        commissionRate: COMMISSION_RATE,
        creatorAmount: order.creatorAmount,
      });
    } catch (payError: any) {
      console.error("[支付] 发起失败:", payError);
      return NextResponse.json(
        { error: "支付发起失败: " + payError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[订单] 创建失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
