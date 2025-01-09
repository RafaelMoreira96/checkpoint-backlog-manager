package utils

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("game-beating-jwt")

func GenerateJWT(name_player string, nickname string, is_active bool, userUD uint, role string, permission int) (string, error) {
	claims := jwt.MapClaims{
		"name_player": name_player,
		"user_id":     userUD,
		"is_active":   is_active,
		"nickname":    nickname,
		"role":        role,
		"permission":  permission,
		"exp":         time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

func JWTMiddleware(c *fiber.Ctx) error {
	tokenString := c.Get("Authorization")
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token not provided"})
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid claims"})
	}

	// Validação das chaves e conversões seguras
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Player ID not found or invalid"})
	}

	permission, ok := claims["permission"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Permission not found or invalid"})
	}

	isActive, ok := claims["is_active"].(bool)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "is_active not found or invalid"})
	}

	nickname, ok := claims["nickname"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Nickname not found or invalid"})
	}

	namePlayer, ok := claims["name_player"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Name player not found or invalid"})
	}

	role, ok := claims["role"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Role not found or invalid"})
	}

	c.Locals("userID", uint(userID))
	c.Locals("role", role)
	c.Locals("permission", uint(permission))
	c.Locals("is_active", isActive)
	c.Locals("nickname", nickname)
	c.Locals("name_player", namePlayer)

	return c.Next()
}
