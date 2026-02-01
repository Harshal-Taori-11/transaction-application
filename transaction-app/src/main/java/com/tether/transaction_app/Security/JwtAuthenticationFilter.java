package com.tether.transaction_app.Security;


import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{

    @Autowired
    private JwtTokenHelper jwtTokenHelper;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/");
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestToken = request.getHeader("Authorization");

        String userName = null;
        String token = null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();


        if(requestToken != null && requestToken.startsWith("Bearer ")) {
            token = requestToken.substring(7);

            try {
                userName = this.jwtTokenHelper.getUserNameFromToken(token);
            }
            catch(IllegalArgumentException e) {
                System.out.println("Unable to get Jwt Token");
            }
            catch(ExpiredJwtException e) {
                System.out.println("Jwt token has expired");
            }
            catch(MalformedJwtException e) {
                System.out.println("Invalid Jwt Token");
            }
        }
        else {
//			filterChain.doFilter(request, response);
            System.out.println("Token doesnot begins with Bearer");
//			return;
        }


        if(userName != null && authentication == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userName);

            if(this.jwtTokenHelper.isTokenValid(token, userDetails)) {

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

            }
            else {
                System.out.println("Invalid Token");
            }

        }

        filterChain.doFilter(request, response);

    }

}