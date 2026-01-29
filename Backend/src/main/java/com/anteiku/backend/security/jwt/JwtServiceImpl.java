package com.anteiku.backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Service
public class JwtServiceImpl  {
    @Value("${app.jwt.signing.private-key}")
    private String privateKey;

    @Value("${app.jwt.issuer}")
    private String issuer;

    public String generateToken(String userEmail, Date expiryDate) {
        Date issuedDate = new Date();
        return Jwts.builder()
                .setSubject(userEmail)
                .claim("userEmail", userEmail)
                .setIssuedAt(issuedDate)
                .setIssuer(issuer)
                .setExpiration(expiryDate)
                .signWith(getPrivateSignKey(), SignatureAlgorithm.HS256).compact();
    }

    public String generateToken(String userEmail) {
        return generateToken(userEmail, Date.from(LocalDate.now().plusDays(1L).atStartOfDay(ZoneId.systemDefault()).toInstant()));
    }

    private Key getPrivateSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(privateKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpirationDate(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .setSigningKey(getPrivateSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenExpired(String token) {
        return extractExpirationDate(token).before(new Date());
    }

    public boolean isTokenValid(String token) {
        return isTokenSignatureValid(token) && !isTokenExpired(token);
    }

    public boolean isTokenSignatureValid(String token) {
        try {
            extractAllClaims(token);
        } catch(Exception e) {
            return false;
        }
        return true;
    }

    public String extractTokenFromACookies(Cookie[] cookies) {
        String token = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("accessToken")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        return token;
    }
}
