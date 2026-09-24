package security

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendPasswordResetEmail envia um e-mail com o link de recuperação de senha
func SendPasswordResetEmail(email, token string) error {
	// Obtém as credenciais do SMTP do .env
	from := os.Getenv("SMTP_FROM")
	password := os.Getenv("SMTP_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	// Verifica se as variáveis de ambiente foram carregadas corretamente
	if from == "" || password == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("SMTP configuration not found in environment variables")
	}

	frontendURL := os.Getenv("APP_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:4200"
	}

	to := email

	// Autenticação no servidor SMTP
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Construção do e-mail
	subject := "Recuperação de Senha"
	body := fmt.Sprintf("Clique no link para redefinir sua senha: %s/reset-password?token=%s", frontendURL, token)
	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s", to, subject, body))

	// Envio do e-mail
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("error sending email: %s", msg)
	}

	return nil
}
