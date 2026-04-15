export async function GET() {
  return Response.json({
    service: "student-management-system",
    routes: [
      "GET /api/health",
      "GET /api/health/live",
      "GET /api/health/ready",
      "GET /api/health/routes",
      "GET /api/health/self-test",
      "GET /api/auth/me",
      "GET /api/students",
      "GET /api/students/:id",
      "POST /api/students",
      "PUT /api/students/:id",
      "DELETE /api/students/:id",
    ],
  });
}
