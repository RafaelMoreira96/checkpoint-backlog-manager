package security

import (
	"github.com/gofiber/fiber/v2"
)

// RequireRole valida se a role do usuário no contexto coincide com as roles permitidas
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("role").(string)
		if !ok || role == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Perfil de acesso não encontrado no token de autenticação",
			})
		}

		for _, allowed := range allowedRoles {
			if role == allowed {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Acesso negado: permissões insuficientes para esta operação",
		})
	}
}
