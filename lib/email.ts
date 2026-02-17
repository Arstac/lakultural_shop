import nodemailer from 'nodemailer';

interface EmailItem {
    title: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: EmailItem[];
    total: number;
}

interface TicketDetails {
    code: string;
    eventName: string;
    attendeeName: string;
}

export async function sendOrderConfirmationEmail(
    order: OrderDetails,
    tickets: TicketDetails[] = []
) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const hasTickets = tickets.length > 0;

    // Generate Items List HTML
    const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.price === 0 ? 'Gratis' : `€${item.price.toFixed(2)}`}</td>
    </tr>
  `).join('');

    // Generate Tickets HTML
    let ticketsHtml = '';
    if (hasTickets) {
        // Generate link to view tickets
        // Assuming the orderId or a token is used to view tickets publicly or by the user
        // The user mentioned: "si es una entrada con el codigo qr generado en el correo"
        // Since we can't easily generate an image attachment without a library or external service, 
        // we will provide a direct link to the ticket page which has the QR code.
        // However, to make it better, we can also just list the codes.

        // Simplest robust approach: Link to the ticket page
        const ticketLink = `https://lakultural.eu/tickets/${order.orderId}`; // Replace with actual domain in production or env var

        ticketsHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
        <h3 style="color: #166534; margin-top: 0;">¡Aquí tienes tus entradas!</h3>
        <p>Has comprado entradas para un evento. Puedes ver tus códigos QR en el siguiente enlace:</p>
        <a href="${ticketLink}" style="display: inline-block; padding: 10px 20px; background-color: #166534; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mis Entradas (QR)</a>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">Presenta el código QR de la web en la entrada del evento.</p>
      </div>
    `;
    }

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #0C5752;">Confirmación de Pedido</h1>
      <p>Hola ${order.customerName},</p>
      <p>Gracias por tu compra en La Kultural. Aquí tienes los detalles de tu pedido:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Pedido ID:</strong> ${order.orderId}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left;">
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Producto</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Cant.</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
             <tr>
              <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; font-weight: bold;">${order.total === 0 ? 'Gratis' : `€${order.total.toFixed(2)}`}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${ticketsHtml}

      <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
        <p>Si tienes alguna pregunta, responde a este correo o contáctanos en <a href="mailto:info@lakultural.eu">info@lakultural.eu</a>.</p>
        <p>La Kultural Shop</p>
      </div>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: '"La Kultural Shop" <info@lakultural.eu>',
            to: order.customerEmail,
            subject: hasTickets ? `Tus Entradas - Pedido ${order.orderId}` : `Confirmación de Pedido ${order.orderId}`,
            html: htmlContent,
        });
        console.log(`Email sent to ${order.customerEmail} for order ${order.orderId}`);
    } catch (error) {
        console.error("Error sending email:", error);
        // We don't throw here to avoid failing the response if email fails, 
        // but in a production app you might want to queue it for retry.
    }
}
